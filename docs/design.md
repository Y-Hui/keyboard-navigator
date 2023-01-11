## 设计思路

若你目前需要把纸质文档上的数据录入到 Web 系统中，提高录入效率才能够让你快速把这项任务完成。
在一次需求迭代中，需要对某个表格进行改造，点击“编辑”按钮时，整个表格从单纯展示数据切换为“编辑态”，几乎所有的单元格都能够对数据进行编辑。

![2.jpg](https://cdn.nlark.com/yuque/0/2022/jpeg/608594/1657128583583-b15ca1a5-7cac-4c03-9f20-ed72387fe83d.jpeg#averageHue=%23eaeaea&clientId=ufcb289ed-1c81-4&crop=0&crop=0&crop=1&crop=1&from=ui&id=u98471805&margin=%5Bobject%20Object%5D&name=2.jpg&originHeight=1355&originWidth=2685&originalType=binary&ratio=1&rotation=0&showTitle=false&size=225893&status=done&style=none&taskId=u442fd9ec-dd6b-43f4-8c1b-3821e4ec403&title=)
这么多输入组件，若是支持使用键盘方向键切换焦点，那样效率相比使用鼠标而言，确实有很大的提升。
这是 `@gm-pc/keyboard` 已有的功能。新架构由于使用 antd 实现业务，所以没能支持它。

### 原组件的问题
因为 `@gm-pc/keyboard` 的实现与 `@gm-pc/react` 耦合程度较高，且在测试它时发现一些问题：

- 一个单元格中包含 input 和 button，点击 button 之后再渲染 input，此时使用方向键切换焦点时却无法激活它，甚至阻挡后面的组件获取焦点。
- 动态渲染列时，表现同上。
- 暂未支持 Radio 组件。
- 若一个单元格中存在多个 input，只能激活最后一个。
- 其实现与 `@gm-pc` 表格组件耦合。

此组件并不支持 antd，又存在一些问题，所以才开发了这样一个新组件。
### 前置概念
> 请仔细阅读这些必要的概念，这样有助于你理解它将如何运行，以便你实现预期效果 😉

#### x 坐标与 y 坐标
![原始.jpg](https://cdn.nlark.com/yuque/0/2022/jpeg/608594/1658052688660-52cfcfe1-f107-4bbb-b573-62303d9f5753.jpeg#averageHue=%23f6f6f6&clientId=uf63eb1be-845e-4&crop=0&crop=0&crop=1&crop=1&from=ui&id=u03a068d0&margin=%5Bobject%20Object%5D&name=%E5%8E%9F%E5%A7%8B.jpg&originHeight=457&originWidth=1249&originalType=binary&ratio=1&rotation=0&showTitle=false&size=37671&status=done&style=none&taskId=ufead2414-9e92-4fd1-8f1e-04d0edfbe6b&title=)
按照我们的直觉思考一下，目前焦点处于第一行第一个表单输入组件（下文称“焦点组件”）。

- 若按下 `→` 键，焦点应当移动到第一行第二个文本框。
- 若按下 `↓` 键，焦点应当移动到第二行第一个文本框。
- ……

将其代入 “平面直角坐标系”中，每一行对应一个 y 坐标，每一列对应一个 x 坐标：
![坐标点.jpg](https://cdn.nlark.com/yuque/0/2022/jpeg/608594/1658052846952-44603277-5f65-4186-97bd-e98ea103e906.jpeg#averageHue=%23f6f6f6&clientId=uf63eb1be-845e-4&crop=0&crop=0&crop=1&crop=1&from=ui&id=u78906c8e&margin=%5Bobject%20Object%5D&name=%E5%9D%90%E6%A0%87%E7%82%B9.jpg&originHeight=457&originWidth=1249&originalType=binary&ratio=1&rotation=0&showTitle=false&size=41921&status=done&style=none&taskId=u8c698668-69b8-447d-960e-76fb93641c2&title=)
现在，有了坐标信息，能够准确描述文本框的位置。例如：第三行第二个文本框的位置为：坐标 (x1, y2)
那么，在记录所有的坐标信息之后，在一个焦点组件中，按下键盘方向键时，便能够很方便的计算应当激活对应的组件。


### 从组件的使用方式开始设计
先前介绍过，我们使用坐标记录各个焦点组件的位置，那就得实现一个组件用于标记他们。
那么坐标得有地方来存储，在这个场景下比较好的做法是使用 [Context](https://reactjs.org/docs/context.html).
所以，我们设想的组件大概会是这样使用的：

```tsx
<KeyboardFocus> {/* 组件内部为 Context */}
  <input x={0} y={0} />
  <input x={1} y={0} />
  <input x={3} y={0} />
</KeyboardFocus>
```

但是 input 并没有 x,y 这样的属性，也无法与 Context 通信，所以要设计一个组件，接收 x,y 坐标，且内部使用 
`useContext` 与 Context 通信。那么它大概是这样的：
```tsx
<KeyboardFocus>
  <KeyboardFocusInput x={0} y={0} /> {/* 基于原生 input 二次封装 */}
  <KeyboardFocusInput x={1} y={0} />
  <KeyboardFocusInput x={3} y={0} />
</KeyboardFocus>
```
这样设计也就意味着对已有业务增加键盘切换焦点功能有一定难度，不得不将原本写好的组件替换成
`<KeyboardFocus** />`组件。原本已有的组件可能有一些定制的样式、功能等，所以，替换组件付出的代价似乎大于接入键盘切换焦点，因为这样的破坏性变更可能还会阻碍你接入它，甚至抵触它。

最终设计出了下面这种样子：
```tsx
<KeyboardFocus>
  <KeyboardFocus.Input y={0} x={0}>
    <input /> {/* 原本的组件/标签不用做任何修改 */}
  </KeyboardFocus.Input>

  <KeyboardFocus.Input y={0} x={1}>
    <input />
  </KeyboardFocus.Input>

  <KeyboardFocus.Input y={0} x={2}>
    <input />
  </KeyboardFocus.Input>
</KeyboardFocus>
```
它是对原组件的一种修饰，当你需要它时，在最外层组件外层包裹 `<KeyboardFocus />`，在文本框外层使用对应的适配组件。若有一天，你不再需要它了，则将包裹文本框的适配组件删除即可，没有较大的破坏性改动。
> 不算贴切的描述：
> 一个手机保护壳，当你需要它时，为手机佩戴上即可，没有很大的变化。而你不需要它时，从手机上取下即可。手机还是手机，没有变化，只是它多了外层的“装饰”。在它加强手机抗跌落性能的同时，你还需要接受手机手感变厚重的事实。

当然，这也不是最优解，它会让代码量增加，过多的修饰容易眼花缭乱，而你在寻找文本框时需要花费一些时间。
### Context 的设计
外层的 Context 组件 `<KeyboardFocus />` 应当做到这些事情：

- 用二维数组记录所有的坐标信息，外层索引值便是 y 坐标，内层索引值便是 x 坐标。
- 向下提供设置坐标的函数 `setPoint(x, y)`
- 向下提供删除坐标的函数，可直接由 `setPoint` 函数返回。
#### `<KeyboardFocus.Input />`的设计
在先前的组件使用设计中，有这样一个组件：`<KeyboardFocus.Input />` 它连接业务组件与坐标轴，它的设计应当是这样的：

- 使用 `useContext` 接收 Context 提供的 `setPoint(x, y)` 函数。
- 接收 x, y 两个 Prop，并在 `useEffect` 中调用 `setPoint` 完成坐标的记录。
- 在 x,y 坐标变化时，再次调用 `setPoint` 函数更新坐标数据。
- 在组件卸载时，将坐标删除。
##### 触发焦点
`<KeyboardFocus.Input />` 作为文本框的修饰，除了记录坐标以外，还有更加重要的一件事情：触发 input 的焦点。
触发焦点很简单，通过 ref 获取到 input DOM 后即可实现，可是谁来触发焦点？
用户在按下对应按键时，计算出下一个坐标的位置，再通知对应坐标的组件激活焦点。
我们通过 `setPoint(x, y)` 函数记录了坐标，那只是单纯的坐标信息，还要再通知它激活焦点。所以可以再将 api 进一步设计：`setPoint(x, y, triggerFocus)` 这第三个参数应当为一个函数，调用它即可激活焦点。
最终，二维数组内存储的数据会是这样的：
![未命名.jpg](https://cdn.nlark.com/yuque/0/2022/jpeg/608594/1658158690249-238e1714-b50e-4e1d-b9a4-e90afab1a51e.jpeg#averageHue=%23f9f8f8&clientId=ub89815f0-2eaf-4&crop=0&crop=0&crop=1&crop=1&from=ui&id=u0fb0967a&margin=%5Bobject%20Object%5D&name=%E6%9C%AA%E5%91%BD%E5%90%8D.jpg&originHeight=457&originWidth=1249&originalType=binary&ratio=1&rotation=0&showTitle=false&size=72421&status=done&style=none&taskId=ucaea12da-5bbd-48fd-8f05-53c593e2e38&title=)
在按下对应按键时，计算出坐标位置，在数组中查找并调用它。
为了让组件逻辑更加简单，不应该在组件内计算下一个坐标，所以 Context 应该提供这样一系列函数：

- `notifyTop(currentX, currentY)`
- `notifyRight(currentX, currentY)`
- `notifyBottom(currentX, currentY)`
- `notifyLeft(currentX, currentY)`

由这些函数来计算下一个坐标位置，并调用 `triggerFocus` 函数。
##### 最终的步骤

- 使用 `useContext` 接收 Context 提供的一系列函数。
- 劫持 input，设置`ref` 获取 DOM 元素。
- 劫持 input，注入 `onKeyDown` 事件，并在 `↑` `↓` `←` `→` 按键按下时调用对应的函数切换焦点。
- 接收 x, y 两个 Prop，并在 `useEffect` 中调用 `setPoint` 完成坐标以及激活焦点函数的记录。
- 在 x,y 坐标变化时，再次调用 `setPoint` 函数更新坐标数据。
- 在组件卸载时，将坐标删除。

再针对 `Select`, `Radio` 等组件进行对应的适配**便完成了最核心的功能设计。**
### 处理 disabled 状态
假如 input 设置了 disabled，那么对应坐标也应当被禁用，按下按键时，则需要跳过被禁用的坐标。
那么 `setPoint` 函数还需要再增加 disabled 参数。
目前 `setPoint` 函数已经具有三个参数了，不排除后续参数继续添加的可能，所以最好是将参数聚合为一个 Object，最后可以直接将这个 Object 存储在二维数组里。
### 自动标记坐标的设计（自动注入坐标值）
在前面的介绍中有提到，在 antd Table 中手动标记坐标值是繁琐的，x 坐标为表头的顺序，y 坐标为存储列表数据数组的索引。那么在这种情况下，x,y 轴都是明确来源的，便能做到坐标值注入。
它是这样设计的：

- 劫持 table columns 属性，遍历它，便能拿到 x 坐标。
- 注入 render 函数，获取第三个参数便是 y 坐标。
- 使用一个新的 Context（`InjectCoordinate`），专门向下传递坐标值。
- 在对应的组件中获取传递下来的坐标即可。
### 焦点分发的设计
得益于先前设计的 `triggerFocus` 函数，使得焦点成为了一个“抽象”概念，只要调用 `setPoint` 函数且提供了 `triggerFocus`，那它便可以视为“焦点组件”。
它是一个“焦点组件”也就能够接受 x,y 坐标值，同理也能接受注入的坐标值，将它看成正常的“焦点组件”即可。
来看看它要解决的问题：
它本身是“焦点组件”，它子元素会存在多个“焦点组件”，那怎么管理这些子坐标？
当然是使用 `<KeyboardFocus />`。
在 Distribution 组件内部使用 `<KeyboardFocus />` 就能够在子坐标 `setPoint` 时[将其拦截](https://reactjs.org/docs/context.html#reactcreatecontext)下来，以此形成一个新的坐标系。
或者将其看成一个陷阱，焦点落到陷阱中时，只能在陷阱中活动，若焦点到达边界，则再将焦点释放出去。
最终它要做的事情大概是这样：

- 接受自动注入的坐标，调用 `setPoint`
- 使用 `<KeyboardFocus />` 创建一个新的坐标系，子坐标将会存储在此处。
- 为了防止自动注入的坐标再向下传递，需要再使用 `<InjectCoordinate />` 向下注入新的坐标。
- 在内部的 `<KeyboardFocus />` 上注册 onError 事件，当这个子坐标系焦点到达边界后，再把焦点发出去。
#### 区分 x 轴模式与 y 轴模式
我们创建这个组件的初衷，是为了解决单一坐标存在多个焦点组件的问题。所以，不应该让坐标支持灵活设置，才提供了 x 轴模式与 y 轴模式。仅支持子元素单一方向排列。
### 优化调整
按下不同的按键调用不同的函数通知其他坐标，这一段逻辑目前位于各个适配组件中。可以将它们集合到一起，命名一个 dispatch 函数，通过传递按键 key 给它，由它来处理不同按键的逻辑。
这便是 `<KeyboardFocus />` 的焦点调度策略。



### Table 之外

在“基本用法”中我们标记 x,y 坐标实现了焦点切换，组件本身并不依赖特定的场景，所以你可以在任何地方添加“键盘控制焦点切换”功能，不过略微繁琐的便是需要提供 x,y 轴。届时，也许能够创造出类似 `<KeyboardFocus.AntdTable />` 这样的适配组件，解放开发人员。

例如这样：
![未命名.jpg](https://cdn.nlark.com/yuque/0/2022/jpeg/608594/1658240171464-c80aca4f-ce4d-4487-9f8d-4fab3b733135.jpeg#averageHue=%23f5f5f5&clientId=u6ff906ee-74ff-4&crop=0&crop=0&crop=1&crop=1&from=ui&id=u927fa219&margin=%5Bobject%20Object%5D&name=%E6%9C%AA%E5%91%BD%E5%90%8D.jpg&originHeight=727&originWidth=1071&originalType=binary&ratio=1&rotation=0&showTitle=false&size=128351&status=done&style=none&taskId=u003d44e9-ea0e-4d1a-baf9-4afa5c1eafb&title=)


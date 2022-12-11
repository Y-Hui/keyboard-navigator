## 全键盘组件的使用与设计思路

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

### 基本用法
有了先前的概念，你应该明白这个组件是如何工作的了。它的基本用法如下
![code.jpg](https://cdn.nlark.com/yuque/0/2022/jpeg/608594/1658054435469-a3062249-5241-4503-93cb-ac5b0f84ba1d.jpeg#averageHue=%23555d64&clientId=uf63eb1be-845e-4&crop=0&crop=0&crop=1&crop=1&from=ui&id=jUgmh&margin=%5Bobject%20Object%5D&name=code.jpg&originHeight=1080&originWidth=1424&originalType=binary&ratio=1&rotation=0&showTitle=false&size=157760&status=done&style=none&taskId=ueb4fa065-0016-4c0f-b5a7-931b5f73bcf&title=)
```tsx
import KeyboardFocus from '@/common/components/keyboard_focus'

export default () => {
  return (
    <KeyboardFocus>
      <div>
        <p>第一行</p>
        <KeyboardFocus.Input y={0} x={0}>
          <input />
        </KeyboardFocus.Input>
        
        <KeyboardFocus.Input y={0} x={1}>
          <input />
        </KeyboardFocus.Input>
        
        <KeyboardFocus.Input y={0} x={2}>
          <input />
        </KeyboardFocus.Input>
      </div>

      <div>
        <p>第二行</p>
        <KeyboardFocus.Input y={1} x={0}>
          <input />
        </KeyboardFocus.Input>
        
        <KeyboardFocus.Input y={1} x={1}>
          <input />
        </KeyboardFocus.Input>
        
        <KeyboardFocus.Input y={2} x={2}>
          <input />
        </KeyboardFocus.Input>
      </div>
    </KeyboardFocus>
  )
}
```
组件本身需要手动传入 x,y 坐标值。因为我们无法得知一个焦点组件应当被放置于哪个位置，只有使用组件的开发者才知道，所以 x,y 值必须由使用组件的开发者提供。
### 与 antd table 一起使用
我们在使用 antd 的 Table 组件时，你需要这样配置 columns:
```tsx
import { Input, InputNumber } from 'antd'
import type { ColumnsType } from 'antd/lib/table/interface'

import KeyboardFocus from '@/common/components/keyboard_focus'

const columns: ColumnsType<unknown> = [
  {
    dataIndex: 'name',
    title: '姓名',
    render(val, row, index) {
      return (
        <KeyboardFocus.Input y={index} x={0}>
          <Input />
        </KeyboardFocus.Input>
      )
    },
  },
  {
    dataIndex: 'age',
    title: '年龄',
    render(val, row, index) {
      return (
        <KeyboardFocus.Input y={index} x={1}>
          <InputNumber keyboard={false} />
        </KeyboardFocus.Input>
      )
    },
  },
  {
    dataIndex: 'age',
    title: '身高',
    render(val, row, index) {
      return (
        <KeyboardFocus.Input y={index} x={2}>
          <InputNumber keyboard={false} />
        </KeyboardFocus.Input>
      )
    },
  },
]
```
此时，x 坐标便是我们定义的表头的顺序，y 坐标是 render 函数的第三个参数，它是渲染时的数据索引值。
但是……这种用法不对，在参与到业务开发中时，可能会对 columns 有诸多调整，每次调整 columns 就意味着需要手动修改一次坐标值。但我们通常会忘记要修改它，最后运行时使用键盘切换焦点就会看起来有些“诡异”。
#### KeyboardFocus.AntdTable 组件
刚刚说到，手动标记坐标在业务开发中总是比较痛苦的，所以自动标记坐标值才尤为重要。
可以使用 `<KeyboardFocus.AntdTable />` 组件对 antd Table 进行修饰，让坐标实现自动标记。
```tsx
import { Input, InputNumber, Table } from 'antd'
import type { ColumnsType } from 'antd/lib/table/interface'

import KeyboardFocus from '@/common/components/keyboard_focus'

const columns: ColumnsType<unknown> = [
  {
    dataIndex: 'name',
    title: '姓名',
    render() {
      return (
        // 不再需要填写 x,y 坐标值
        <KeyboardFocus.Input>
          <Input />
        </KeyboardFocus.Input>
      )
    },
  },
  {
    dataIndex: 'age',
    title: '年龄',
    render() {
      return (
        <KeyboardFocus.Input>
          <InputNumber keyboard={false} />
        </KeyboardFocus.Input>
      )
    },
  },
  {
    dataIndex: 'age',
    title: '身高',
    render() {
      return (
        <KeyboardFocus.Input>
          <InputNumber keyboard={false} />
        </KeyboardFocus.Input>
      )
    },
  },
]

export default () => {
  return (
    <KeyboardFocus.AntdTable>
      <Table columns={columns} />
    </KeyboardFocus.AntdTable>
  )
}
```
 `<KeyboardFocus.AntdTable />` 会劫持 Table 的 columns 属性，在 render 函数中注入坐标信息，x 坐标来源于 columns 的索引，y 坐标来源于 render 函数的第三个参数。
这样确实在开发体验上有了非常大的提升，但是，这样却需要付出代价。
### 代价
前面 antd Table 的例子中似乎缺少了什么。
思考一下这个表格：
![complex.jpg](https://cdn.nlark.com/yuque/0/2022/jpeg/608594/1658056560392-e4c9e8d6-e6b4-4882-8237-7b72d38b92a1.jpeg#averageHue=%23f4f3f3&clientId=uf63eb1be-845e-4&crop=0&crop=0&crop=1&crop=1&from=ui&id=uefe34e11&margin=%5Bobject%20Object%5D&name=complex.jpg&originHeight=415&originWidth=2177&originalType=binary&ratio=1&rotation=0&showTitle=false&size=60346&status=done&style=none&taskId=u488e98a4-dfb4-4323-bb0c-9e06e79bd62&title=)
在“销售价”和“销售状态”这两列中，存在多个焦点组件。
若我们手动标记坐标：
x0 为：名称
x1 为：类型
x2 为：存量
x3 为：销售价中第一个文本框
x4 为：销售价中第二个选择框
x5 为：“上架”的单选按钮
x6 为：“下架”的单选按钮
在手动标记时，“销售价”和“销售状态”这两个单元格在逻辑上被“拆开”使用了，我们手动填写坐标时，完整描述了每一个焦点组件。
但这是人为因素，是我们主动将它拆分的，`<KeyboardFocus.AntdTable />` 组件是不具有这种能力的，它在自动注入坐标值时，无法得知 Table 中每个单元格存在焦点组件的数量，因为它是通过遍历 columns 来实现的，它将单元格视为一个整体，只有一个坐标值。
这样就意味着一个单元格中存在多个焦点组件时，始终只有一个组件能够获取焦点，而另一个则始终无法被“激活”。

**这便是自动标记坐标所需要付出的代价。**
### 焦点分发
在上一节中，介绍了自动标记坐标所带来的问题，在这一节中将会帮助你**弥补**自动标记的代价。
> 注意：是弥补，而不是修复这个缺陷。仅在目前看来这个缺陷确实无法修复。

`<KeyboardFocus.AntdTable />` 组件把单元格视为一个坐标，那么手动将它“拆分”便可以了。
使用 `<KeyboardFocus.Distribution />` 组件可实现一个焦点分发给多个焦点组件。
那么，在配置 column 时你需要这样写：
```tsx
import { Input, InputNumber, Radio, Select, Table } from 'antd'
import type { ColumnsType } from 'antd/lib/table/interface'

import KeyboardFocus from '@/common/components/keyboard_focus'

const columns: ColumnsType<unknown> = [
  {
    dataIndex: 'name',
    title: '存量',
    render() {
      return (
        <KeyboardFocus.Input>
          <Input />
        </KeyboardFocus.Input>
      )
    },
  },
  {
    dataIndex: 'price',
    title: '销售价',
    render() {
      return (
        <KeyboardFocus.Distribution>
          <KeyboardFocus.Input x={0}>
            <InputNumber keyboard={false} />
          </KeyboardFocus.Input>
          <span>/</span>
          <KeyboardFocus.AntdSelect x={1}>
            <Select />
          </KeyboardFocus.AntdSelect>
        </KeyboardFocus.Distribution>
      )
    },
  },
  {
    dataIndex: 'sale',
    title: '销售状态',
    render() {
      return (
        <KeyboardFocus.Distribution>
          <Radio.Group>
            <KeyboardFocus.AntdRadio x={0}>
              <Radio value>上架</Radio>
            </KeyboardFocus.AntdRadio>
            <KeyboardFocus.AntdRadio x={1}>
              <Radio value={false}>下架</Radio>
            </KeyboardFocus.AntdRadio>
          </Radio.Group>
        </KeyboardFocus.Distribution>
      )
    },
  },
]

export default () => {
  return (
    <KeyboardFocus.AntdTable>
      <Table columns={columns} />
    </KeyboardFocus.AntdTable>
  )
}

```
上面的代码可以看到，正常情况下不需要填写 x,y 坐标，但是在焦点分发组件中，需要填写 x 坐标。 x 坐标从 0 开始标记。
#### 为什么焦点分发组件内需要手动标记坐标？
在这之前，自动标记坐标的是与 antd Table 耦合的，通过遍历其 columns 来实现。但是如果脱离了它，就无法得知坐标的确切位置，需要手动填写。
在默认模式下，此组件实际上是在单元格中创建了一个仅有 x 轴的坐标（y 坐标始终为 0），因为是一个独立的坐标系，所以，在填写 x 坐标的时候需要重新开始。
### 组件说明
#### `<KeyboardFocus />`
核心组件，内部存储所有的坐标。

| Props | 说明 | 类型 | 默认值 | 是否必填 |
| --- | --- | --- | --- | --- |
| dispatch | 焦点调度策略 | `DispatchFn` | 默认调度 |  ❌ |
| onError | 错误处理 | `(type: VectorError, focusFrom: FocusFrom) => void` | - |  ❌ |
| onFocus | 组件处于焦点后触发 | `(x: number, y: number) => void` | - |  ❌ |
| onBlur | 组件失焦后触发 | `(x: number, y: number) => void` | - | ❌ |
| ref | 通过 ref 获取到内部提供的一系列函数 | 与下文中 `useKeyboardFocus`返回值相同 | - | ❌ |

默认焦点调度函数位于组件更目录下：`dispatch_strategy.ts`文件。
##### 错误定义
```typescript
const VECTOR_ERROR = {
  /** 对应 X 坐标不存在 */
  NOT_X_AXIS: 'NOT_X_AXIS',
  /** 对应 Y 坐标不存在 */
  NOT_Y_AXIS: 'NOT_Y_AXIS',
  /** 目前处于 X 轴极大值 */
  X_MAXIMUM: 'X_MAXIMUM',
  /** 目前处于 Y 轴极大值 */
  Y_MAXIMUM: 'Y_MAXIMUM',
  /** 目前处于 X 轴极小值 */
  X_MINIMUM: 'X_MINIMUM',
  /** 目前处于 Y 轴极小值 */
  Y_MINIMUM: 'Y_MINIMUM',
  /** 对应 Y 轴中没有坐标点 */
  EMPTY: 'EMPTY',
  /** 对应坐标点已被禁用 */
  DISABLED: 'DISABLED',
}
```
##### 类型签名
```typescript
interface FocusFrom {
  /** 来源 x 坐标 */
  x: number
  /** 来源 y 坐标 */
  y: number
  /** 按键名称 */
  keyName: string
  /** 触发类型（组件名称） */
  type: string
  /** 一个坐标点中的子坐标，焦点分发时才存在 */
  subX?: number
  /** 一个坐标点中的子坐标，焦点分发时才存在 */
  subY?: number
}
```
#### `<KeyboardFocus.Input />`
适用于原生 input 标签与 antd `<Input />` 与 `<InputNumber />` 组件。
因为 antd `<InputNumber />` 组件有默认带有键盘行为（按下 `↑`、`↓` 键可让数值增加/减少），这与切换焦点有冲突，需要手动关闭它。
```tsx
<KeyboardFocus.Input>
  <input />
</KeyboardFocus.Input>

<KeyboardFocus.Input>
  <Input />
</KeyboardFocus.Input>

<KeyboardFocus.Input>
  {/* InputNumber 组件关闭默认键盘行为 */}
  <InputNumber keyboard={false} />
</KeyboardFocus.Input>
```
#### `<KeyboardFocus.AntdSelect/>`
适用于 antd `<Select />` 组件。
```tsx
<KeyboardFocus.AntdSelect>
  <Select />
</KeyboardFocus.AntdSelect>
```
#### `<KeyboardFocus.AntdCascader />`
适用与 antd `<Cascader/>` 组件。
```tsx
<KeyboardFocus.AntdCascader>
  <Cascader />
</KeyboardFocus.AntdCascader>
```
#### `<KeyboardFocus.AntdRadio />`
适用于 antd `<Radio />` 组件。
```tsx
<Radio.Group>
  <KeyboardFocus.AntdRadio>
    <Radio value>Label 1</Radio>
  </KeyboardFocus.AntdRadio>
  <KeyboardFocus.AntdRadio>
    <Radio value={false}>Label 2</Radio>
  </KeyboardFocus.AntdRadio>
</Radio.Group>
```
#### `<KeyboardFocus.AntdTable />`
适用于 antd `<Table />` 组件，含有自动标记坐标功能、焦点组件被遮挡时自动滚动水平滚动条。

| Props | 说明 | 类型 | 默认值 | 是否必填 |
| --- | --- | --- | --- | --- |
| leftFixedWidth | 左侧固定列的总宽度（用于在执行滚动时计算） | `number &#124; (() => number)` | 0 |  ❌ |
| rightFixedWidth | 右侧固定列的总宽度（用于在执行滚动时计算） | `number &#124; (() => number)` | 0 | ❌ |

除以上 Props 外，此组件还接收所有 KeyboardFocus 组件 Props.
#### `<KeyboardFocus.Distribution />`
焦点分发组件，它是为解决 Table 单元格只有一个坐标情况下，无法精确描述焦点组件而出现的，但它却不局限于这个场景。
它在 Context 下运行，并且它内部会创建一个新的坐标系。
因为它的作用是将一个坐标进行分发，所以，它本身也是一个坐标，也是一个“焦点组件”。

| Props | 说明 | 类型 | 默认值 | 是否必填 |
| --- | --- | --- | --- | --- |
| x | x 坐标 | number | - | ❌ |
| y | y 坐标 | number | - | ❌ |
| mode | 分发模式 | `"x" &#124; "y"` | `x` | ❌ |

在 mode 为 x 时：y 坐标始终为 0。
在 mode 为 y 时：x 坐标始终为 0。
##### 通过 props 指定模式
```tsx
// 默认以 x 轴模式运行 (通过 “左/右” 方向键切换焦点)
<KeyboardFocus.Distribution>
  <KeyboardFocus.Input x={0}>
    <Input />
  </KeyboardFocus.Input>
  <KeyboardFocus.Input x={1}>
    <Input />
  </KeyboardFocus.Input>
</KeyboardFocus.Distribution>


// 以 y 轴模式运行 (通过 “上/下” 方向键切换焦点)
<KeyboardFocus.Distribution mode="y">
  <KeyboardFocus.Input y={0}>
    <Input />
  </KeyboardFocus.Input>
  <KeyboardFocus.Input y={1}>
    <Input />
  </KeyboardFocus.Input>
</KeyboardFocus.Distribution>
```
![mode.png](https://cdn.nlark.com/yuque/0/2022/png/608594/1658111880707-39c7349a-c1a3-4180-9275-1d19e9d3f688.png#averageHue=%23eeeeee&clientId=u2f4c32eb-6a1d-4&crop=0&crop=0&crop=1&crop=1&from=ui&id=OKXyt&margin=%5Bobject%20Object%5D&name=mode.png&originHeight=320&originWidth=560&originalType=binary&ratio=1&rotation=0&showTitle=false&size=21783&status=done&style=none&taskId=u7dacd1c2-8574-49dc-9eda-15f1765886b&title=)
#### useKeyboardFocus 
此 hook 用于和 Context 通信，在设计适配组件时需要使用，上面这些组件内部有使用它。
它会提供这些属性/函数：

- setPoint
设置坐标点，返回值是一个函数，用于删除坐标点。
- dispatch
焦点派发，在按下键盘按键时调用，通常在 `onKeyDown` 事件中调用。
- syncFocusState
同步焦点状态。例如通过鼠标点击文本框聚焦时，需要在 `onFocus` 函数中调用它，以便正常触发
 `<KeyboardFocus />`的 `onFocus` 回调。
- syncBlurState
同步失焦状态。例如通过鼠标点击页面其他地方使文本框失焦时，需要在 `onBlur` 函数中调用它，以便正常触发 `<KeyboardFocus />`的 `onBlur` 回调。
- notifyVectorByKeyOnXAxis
通过 key 通知某一行中的一个坐标。
参数 1 为 focusKey 值。
参数 2 为 y 坐标值。
- notifyVectorByKeyOnYAxis
通过 key 通知某一列中的一个坐标。
参数 1 为 focusKey 值。
参数 2 为 x 坐标值。

以下函数/属性一般而言用不上。

- coordinates
坐标数据（二维数组）
- notify(x, y)
通知对应的坐标点，正常情况而言用不上。
- notifyXLast
通知对应 y 轴上最后一个组件
- notifyXFirst
通知对应 y 轴上第一个组件
- notifyYFirst
通知 x 坐标上 y 轴第一个可用坐标
- notifyYLast
通知 x 坐标上 y 轴最后一个可用坐标
- triggerBlur
触发其他坐标调用 blur 函数。
```tsx
import { useKeyboardFocus } from '@/common/components/keyboard_focus'

const { setPoint, dispatch, syncFocusState, syncBlurState } = useKeyboardFocus()


// 以下为示例代码，你应当把它写在 useEffect 中。
// 返回值为删除此坐标的函数
const removePoint = setPoint({
  x: 0,
  y: 0,
  vector: {
    // disabled 状态（可选）
    disabled: false, 
    
    // 可选
    blur() {
      console.log('此函数会在其他坐标被激活时调用')
    },
    
    // 可选
    onSuccess() {
      console.log('切换到其他坐标后回调')
    },
    
    // 必填
    trigger() {
      console.log('你应当在此处实现焦点的触发')
      
      // 假设 inputDOM 为真实 DOM 元素。
      inputDOM.focus()
    },
  },
})


<input
  onFocus={() => {
    syncFocusState(x, y)
  }}
  onBlur={() => {
    syncBlurState(x, y)
  }}
  onKeyDown={(e) => {
    // 调用 dispatch 自动完成焦点切换
    dispatch({
      currentX: x,
      currentY: y,
      keyName: e.key,
      type: "Input",
    })
  }}
/>
```
#### useInjectCoordinate
获取自动注入的坐标。因为组件既可以手动传入坐标，也需要兼容自动注入坐标的场景。
自动注入坐标即为使用 `<KeyboardFocus.AntdTable />` 的场景。
> **注意：组件 Props 的 x,y 坐标拥有最高优先级。在 Props 没有 x,y 值的情况下才使用注入的坐标。**

```tsx
import { useInjectCoordinate } from '@/common/components/keyboard_focus'

interface MyInputProps {
  x?: number
  y?: number
}

const MyInput: VFC<MyInputProps> = (props) => {
  // 可接收自动注入的坐标
  const [x, y] = useInjectCoordinate(props.x, props.y)
  
  return <input />
}
```
#### useFocusCoordinate
记录当前焦点坐标的 hook。内置延迟更新。
该 hook 接收两个参数。

- 参数 1：聚焦前延迟毫秒数。默认为 16.7ms
- 参数 2：失焦前延迟毫秒数。默认为 16.7ms
```tsx
import KeyboardFocus, { useFocusCoordinate } from '@/common/components/keyboard_focus'


export default () => {
  // 当前激活的 x,y 坐标，该值可能为 undefined。
  const [{ x, y }, { onFocus, onBlur }] = useFocusCoordinate()
  
  return <KeyboardFocus onFocus={onFocus} onBlur={onBlur} />
}
```
#### useFocusYAxis
记录当前焦点的 y 坐标。内置延迟更新。
该 hook 接收两个参数。

- 参数 1：聚焦前延迟毫秒数。默认为 16.7ms
- 参数 2：失焦前延迟毫秒数。默认为 16.7ms
```tsx
import KeyboardFocus, { useFocusYAxis } from '@/common/components/keyboard_focus'


export default () => {
  // 当前激活的 y 坐标，该值可能为 undefined。
  const [y, { onFocus, onBlur }] = useFocusYAxis()
  
  return <KeyboardFocus onFocus={onFocus} onBlur={onBlur} />
}
```
#### 自定义组件
```tsx
import KeyboardFocus, { useInjectCoordinate, useKeyboardFocus } from '@/common/components/keyboard_focus'

interface NewComponentProps {
  x?: number
  y?: number
}

const NewComponent: React.VFC<NewComponentProps> (props) => {
  // 接受自动注入的坐标
  const [x, y] = useInjectCoordinate(props.x, props.y)

  const { setPoint, dispatch, syncFocusState, syncBlurState } = useKeyboardFocus()
  
  const inputNode = useRef<HTMLInputElement>(null)
  
  useEffect(() => {
    return setPoint({
      x,
      y,
      vector: {
        trigger() {
          // 设置焦点
          inputNode.current?.focus()
        },
      },
    })
  }, [x, y, setPoint])
  
  return (
    <input
      ref={inputNode}
        onFocus={() => {
        syncFocusState(x, y)
      }}
      onBlur={() => {
        syncBlurState(x, y)
      }}
      onKeyDown={(e) => {
        // 调用 dispatch 自动完成焦点切换
        dispatch({
          currentX: x,
          currentY: y,
          keyName: e.key,
          type: 'NewComponent',
        })
    	}}
    />
  )
}

export default () => {
  return (
    <KeyboardFocus>
      {/* 此组件本身支持焦点切换，直接使用即可 */}
      <NewComponent x={0} y={0} />
      <NewComponent x={1} y={0} />
    </KeyboardFocus>
  )
}
```
#### 注意事项
以上适配组件依赖组件 ref 和键盘事件，若提供的组件不支持设置 ref，那么将无法设置焦点。
你可能会将原生标签经过一次封装：
![diff.jpg](https://cdn.nlark.com/yuque/0/2022/jpeg/608594/1658283488629-5f67edce-4aca-45f8-b059-835d1a5efdd7.jpeg#averageHue=%238a65a2&clientId=ubc673b07-f9d8-4&crop=0&crop=0&crop=1&crop=1&from=ui&id=u6c6cc7a1&margin=%5Bobject%20Object%5D&name=diff.jpg&originHeight=1300&originWidth=1524&originalType=binary&ratio=1&rotation=0&showTitle=false&size=712037&status=done&style=none&taskId=u21b15991-e1ce-4901-961d-8a33ca15552&title=)
> 2022-08-01 补充更新：
> 注意：除 ref 与键盘事件外，还需要支持设置 onFocus 和 onBlur 事件，以便用户通过鼠标使文本框聚焦/失焦时正确触发 `<KeyboardFocus />` 组件的回调。


或者 antd 的组件：
```tsx
import { Select } from 'antd'
import { forwardRef } from 'react'

const BadSelect = () => {
  // 省略一些其他代码
  return <Select />
}

const GoodSelect = forwardRef((props, ref) => {
  const { options, ...rest } = props
  
  return <Select {...rest} ref={ref} options={options} />
})

export default () => {
  <KeyboardFocus>
    <KeyboardFocus.AntdSelect x={0} y={0}>
      {/* 没有任何效果，因为缺少键盘事件和 ref */}
      <BadSelect />
    </KeyboardFocus.AntdSelect>
    
    <KeyboardFocus.AntdSelect x={1} y={0}>
      {/* 正常响应焦点，因为能够注入 ref 和键盘事件 */}
      <GoodSelect />
    </KeyboardFocus.AntdSelect>
  </KeyboardFocus>
}
```
### Disabled
对于表单组件，总是会存在 disabled 状态。适配组件会主动读取名为 `disabled` 的 props，所以，如果组件设置了 disabled，那么对应坐标也会被禁用，在切换焦点时，会直接越过它。
```tsx
<KeyboardFocus.Input>
  {/* 设置 disabled 后，坐标也会被禁用 */}
  <input disabled />
</KeyboardFocus.Input>


<KeyboardFocus.AntdSelect>
  <Select disabled />
</KeyboardFocus.AntdSelect>


{/* 如果你的自定义组件 disabled 为其他名称时，需要自行处理 disabled 状态 */}
<KeyboardFocus.Input disabled>
  <MyInput disabledInput />
</KeyboardFocus.Input>
```
#### antd Radio 组件 disabled 特殊处理
通常我们使用 Radio 组件时，都会使用 `<Radio.Group />` 组件，若需要禁用整个 Radio 选项，我们会这样这设置：
```tsx
<Radio.Group disabled>
  <Radio /> {/* 已被禁用 */}
  <Radio /> {/* 已被禁用 */}
</Radio.Group>
```
但是，因为 `<KeyboardFocus.AntdRadio />` 并不能直接与其进行通信，所以是没有效果的，你应该这样写：
```tsx
const [disabled] = useState(true)


<Radio.Group disabled={disabled}>
  <KeyboardFocus.AntdRadio disabled={disabled}>
    <Radio value>Label 1</Radio>
  </KeyboardFocus.AntdRadio>
  
  <KeyboardFocus.AntdRadio disabled={disabled}>
    <Radio value={false}>Label 2</Radio>
  </KeyboardFocus.AntdRadio>
</Radio.Group>
```
### 手动设置组件聚焦
#### 1. 使用坐标值：
```tsx
import KeyboardFocus, { KeyboardFocusContextRef } from '@/common/components/keyboard_focus'
import { useRef } from 'react'

export default () => {
  const keyboardFocus = useRef<KeyboardFocusContextRef | null>(null)

  // 你可以传入坐标值手动设置某个组件为焦点状态
  // keyboardFocus.notify(0, 0)
  
  return (
    <KeyboardFocus ref={keyboardFocus}>
      {/* 省略其他内容 */}
    </KeyboardFocus>
  )
}
```
#### 2. 使用 focusKey：
使用坐标值总是麻烦的，而为组件设置一个 key，这件事情就稍微简单一些了。
```tsx
import KeyboardFocus, { KeyboardFocusContextRef } from '@/common/components/keyboard_focus'
import { useRef } from 'react'

export default () => {
  const keyboardFocus = useRef<KeyboardFocusContextRef | null>(null)

  // 通知 y 坐标为 0 的 x 轴上 focusKey 为 foo 的组件。
  // keyboardFocus.notifyVectorByKeyOnXAxis('foo', 0)


  // keyboardFocus.notifyVectorByKeyOnXAxis('bar', 1)
  
  return (
    <KeyboardFocus ref={keyboardFocus}>
      <KeyboardFocus.Input x={0} y={0} focusKey="foo">
        <input />
      </KeyboardFocus.Input>
      <KeyboardFocus.Input x={0} y={1} focusKey="bar">
        <input />
      </KeyboardFocus.Input>
      {/* 省略其他内容 */}
    </KeyboardFocus>
  )
}
```
### Table 之外
在“基本用法”中我们标记 x,y 坐标实现了焦点切换，组件本身并不依赖特定的场景，所以你可以在任何地方添加“键盘控制焦点切换”功能，不过略微繁琐的便是需要提供 x,y 轴。届时，也许能够创造出类似 `<KeyboardFocus.AntdTable />` 这样的适配组件，解放开发人员。

例如这样：
![未命名.jpg](https://cdn.nlark.com/yuque/0/2022/jpeg/608594/1658240171464-c80aca4f-ce4d-4487-9f8d-4fab3b733135.jpeg#averageHue=%23f5f5f5&clientId=u6ff906ee-74ff-4&crop=0&crop=0&crop=1&crop=1&from=ui&id=u927fa219&margin=%5Bobject%20Object%5D&name=%E6%9C%AA%E5%91%BD%E5%90%8D.jpg&originHeight=727&originWidth=1071&originalType=binary&ratio=1&rotation=0&showTitle=false&size=128351&status=done&style=none&taskId=u003d44e9-ea0e-4d1a-baf9-4afa5c1eafb&title=)
### 为什么删除坐标的方式有些奇怪？
> 2022-09-09 更新：此小节内容已过时。但是为了记录 useEffect 这个不同的表现，此小节不做删除。
> 在后续迭代开发中，发现下面这种方式无法删除坐标，导致了 bug。

你看见这样的代码可能有点疑惑：
```tsx
const removePoint = useRef<() => void>()

useEffect(
  () => () => {
    removePoint.current && removePoint.current()
  },
  [],
)

useEffect(() => {
  removePoint.current = setPoint({/* 省略代码 */})
}, [x, y, setPoint])



// 2022-09-09 补充：现在你应该这样写，上面的做法会导致 bug
useEffect(() => {
  return setPoint({/* 省略代码 */})
}, [x, y, setPoint])
```
setPoint 函数会直接返回删除当前坐标的函数，所以在 useEffect 中直接 return 就就可以，可是却如此大费周章编写。
其实，这是基于 useEffect 的调用顺序才调整的结果。
如果你直接在 useEffect 中 return removePoint 函数。设想这样一个场景，有一个列表，你可以点击按钮在列表中间插入一行。
我们以为的组件渲染顺序为：

1. 坐标 1 渲染，添加坐标 1
2. 插入一行
3. 坐标 1 让位，变成坐标 2，删除坐标 1 数据。
4. 坐标 1 渲染（新插入的行），添加坐标 1（新数据）
5. 坐标 2 渲染（原本的坐标 1 那个组件），添加坐标 2。（此时组件没有卸载，处于更新阶段）

看起来没有问题，然而事与愿违。在** React 16 **中，其实这样的执行顺序：

1. 坐标 1 渲染，添加坐标 1
2. 插入一行
3. 坐标 1 渲染（新插入的行），添加坐标 1（新数据）
4. 原坐标 1 让位，变成坐标 2，清理副作用（删除坐标 1 数据），添加坐标 2。
（此时组件没有卸载的，处于更新阶段）

看到这样的执行顺序，不可避免会造成 bug，所以才会将 removePoint 函数放置在 ref 中。使用一个 deps 为空的 useEffect 则表示：仅在组件被卸载时才调用 removePoint 函数，所以**更新阶段不会再清理副作用**。

**useEffect 这样的调用顺序似乎有点不太合理，而在 React 17 及以上则与我们预想的调用顺序相同。**
### 遇到问题需要 Debug？
组件根目录下 `dispatch_strategy.ts` 文件，它负责整个组件的焦点调度。在按键被按下时调用的 dispatch 函数便是它，所以不妨在此处 debug。
### 设计思路
#### 从组件的使用方式开始设计
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
#### Context 的设计
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
#### 处理 disabled 状态
假如 input 设置了 disabled，那么对应坐标也应当被禁用，按下按键时，则需要跳过被禁用的坐标。
那么 `setPoint` 函数还需要再增加 disabled 参数。
目前 `setPoint` 函数已经具有三个参数了，不排除后续参数继续添加的可能，所以最好是将参数聚合为一个 Object，最后可以直接将这个 Object 存储在二维数组里。
#### 自动标记坐标的设计（自动注入坐标值）
在前面的介绍中有提到，在 antd Table 中手动标记坐标值是繁琐的，x 坐标为表头的顺序，y 坐标为存储列表数据数组的索引。那么在这种情况下，x,y 轴都是明确来源的，便能做到坐标值注入。
它是这样设计的：

- 劫持 table columns 属性，遍历它，便能拿到 x 坐标。
- 注入 render 函数，获取第三个参数便是 y 坐标。
- 使用一个新的 Context（`InjectCoordinate`），专门向下传递坐标值。
- 在对应的组件中获取传递下来的坐标即可。
#### 焦点分发的设计
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
##### 区分 x 轴模式与 y 轴模式
我们创建这个组件的初衷，是为了解决单一坐标存在多个焦点组件的问题。所以，不应该让坐标支持灵活设置，才提供了 x 轴模式与 y 轴模式。仅支持子元素单一方向排列。
#### 优化调整
按下不同的按键调用不同的函数通知其他坐标，这一段逻辑目前位于各个适配组件中。可以将它们集合到一起，命名一个 dispatch 函数，通过传递按键 key 给它，由它来处理不同按键的逻辑。
这便是 `<KeyboardFocus />` 的焦点调度策略。
### 最后
愿你不被本篇文章所提出的设计思路所限制，提出打破常规的建议帮助完善此组件。

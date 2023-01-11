## 快速上手

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
import KeyboardFocus from './keyboard_focus'

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

import KeyboardFocus from './keyboard_focus'

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

import KeyboardFocus from './keyboard_focus'

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

import KeyboardFocus from './keyboard_focus'

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

#### 2. 使用 focusKey

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



### Q&A

#### 为什么删除坐标的方式有些奇怪？

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



#### 遇到问题需要 Debug？
组件根目录下 `dispatch_strategy.ts` 文件，它负责整个组件的焦点调度。在按键被按下时调用的 dispatch 函数便是它，所以不妨在此处 debug。

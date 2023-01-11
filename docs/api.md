## API

### `<KeyboardFocus />`
核心组件，内部存储所有的坐标。

| Props | 说明 | 类型 | 默认值 | 是否必填 |
| --- | --- | --- | --- | --- |
| dispatch | 焦点调度策略 | `DispatchFn` | 默认调度 |  ❌ |
| onError | 错误处理 | `(type: VectorError, focusFrom: FocusFrom) => void` | - |  ❌ |
| onFocus | 组件处于焦点后触发 | `(x: number, y: number) => void` | - |  ❌ |
| onBlur | 组件失焦后触发 | `(x: number, y: number) => void` | - | ❌ |
| ref | 通过 ref 获取到内部提供的一系列函数 | 与下文中 `useKeyboardFocus`返回值相同 | - | ❌ |

默认焦点调度函数位于组件更目录下：`dispatch_strategy.ts`文件。
#### 错误定义
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
#### 类型签名
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
### `<KeyboardFocus.Input />`
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
### `<KeyboardFocus.AntdSelect/>`
适用于 antd `<Select />` 组件。
```tsx
<KeyboardFocus.AntdSelect>
  <Select />
</KeyboardFocus.AntdSelect>
```
### `<KeyboardFocus.AntdCascader />`
适用与 antd `<Cascader/>` 组件。
```tsx
<KeyboardFocus.AntdCascader>
  <Cascader />
</KeyboardFocus.AntdCascader>
```
### `<KeyboardFocus.AntdRadio />`
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
### `<KeyboardFocus.AntdTable />`
适用于 antd `<Table />` 组件，含有自动标记坐标功能、焦点组件被遮挡时自动滚动水平滚动条。

| Props | 说明 | 类型 | 默认值 | 是否必填 |
| --- | --- | --- | --- | --- |
| leftFixedWidth | 左侧固定列的总宽度（用于在执行滚动时计算） | `number &#124; (() => number)` | 0 |  ❌ |
| rightFixedWidth | 右侧固定列的总宽度（用于在执行滚动时计算） | `number &#124; (() => number)` | 0 | ❌ |

除以上 Props 外，此组件还接收所有 KeyboardFocus 组件 Props.
### `<KeyboardFocus.Distribution />`
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
#### 通过 props 指定模式
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
### useKeyboardFocus 
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
import { useKeyboardFocus } from './keyboard_focus'

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
### useInjectCoordinate
获取自动注入的坐标。因为组件既可以手动传入坐标，也需要兼容自动注入坐标的场景。
自动注入坐标即为使用 `<KeyboardFocus.AntdTable />` 的场景。
> **注意：组件 Props 的 x,y 坐标拥有最高优先级。在 Props 没有 x,y 值的情况下才使用注入的坐标。**

```tsx
import { useInjectCoordinate } from './keyboard_focus'

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
### useFocusCoordinate
记录当前焦点坐标的 hook。内置延迟更新。
该 hook 接收两个参数。

- 参数 1：聚焦前延迟毫秒数。默认为 16.7ms
- 参数 2：失焦前延迟毫秒数。默认为 16.7ms
```tsx
import KeyboardFocus, { useFocusCoordinate } from './keyboard_focus'


export default () => {
  // 当前激活的 x,y 坐标，该值可能为 undefined。
  const [{ x, y }, { onFocus, onBlur }] = useFocusCoordinate()
  
  return <KeyboardFocus onFocus={onFocus} onBlur={onBlur} />
}
```
### useFocusYAxis
记录当前焦点的 y 坐标。内置延迟更新。
该 hook 接收两个参数。

- 参数 1：聚焦前延迟毫秒数。默认为 16.7ms
- 参数 2：失焦前延迟毫秒数。默认为 16.7ms
```tsx
import KeyboardFocus, { useFocusYAxis } from './keyboard_focus'


export default () => {
  // 当前激活的 y 坐标，该值可能为 undefined。
  const [y, { onFocus, onBlur }] = useFocusYAxis()
  
  return <KeyboardFocus onFocus={onFocus} onBlur={onBlur} />
}
```
### 自定义组件
```tsx
import KeyboardFocus, { useInjectCoordinate, useKeyboardFocus } from './keyboard_focus'

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
### 注意事项
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
### Table 之外
在“基本用法”中我们标记 x,y 坐标实现了焦点切换，组件本身并不依赖特定的场景，所以你可以在任何地方添加“键盘控制焦点切换”功能，不过略微繁琐的便是需要提供 x,y 轴。届时，也许能够创造出类似 `<KeyboardFocus.AntdTable />` 这样的适配组件，解放开发人员。

例如这样：
![未命名.jpg](https://cdn.nlark.com/yuque/0/2022/jpeg/608594/1658240171464-c80aca4f-ce4d-4487-9f8d-4fab3b733135.jpeg#averageHue=%23f5f5f5&clientId=u6ff906ee-74ff-4&crop=0&crop=0&crop=1&crop=1&from=ui&id=u927fa219&margin=%5Bobject%20Object%5D&name=%E6%9C%AA%E5%91%BD%E5%90%8D.jpg&originHeight=727&originWidth=1071&originalType=binary&ratio=1&rotation=0&showTitle=false&size=128351&status=done&style=none&taskId=u003d44e9-ea0e-4d1a-baf9-4afa5c1eafb&title=)


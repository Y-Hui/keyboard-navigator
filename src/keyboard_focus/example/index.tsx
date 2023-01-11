import './index.less'

import {
  Button,
  Cascader,
  Form,
  Input,
  InputNumber,
  message,
  Modal,
  Radio,
  Select,
  Table,
} from 'antd'
import { ColumnsType } from 'antd/lib/table/interface'
import { filter, slice, times } from 'lodash-es'
import React, { useMemo, useRef, useState } from 'react'

import KeyboardFocus, { KeyboardFocusContextRef, useFocusYAxis } from '../index'

const { Option } = Select

interface Data {
  key: number
  isEdit: boolean
  isNone?: boolean
}

interface Option2 {
  value: string | number
  label: string
  children?: Option2[]
}

const options: Option2[] = [
  {
    value: 'zhejiang',
    label: 'Zhejiang',
    children: [
      {
        value: 'hangzhou',
        label: 'Hangzhou',
        children: [
          {
            value: 'xihu',
            label: 'West Lake',
          },
        ],
      },
    ],
  },
  {
    value: 'jiangsu',
    label: 'Jiangsu',
    children: [
      {
        value: 'nanjing',
        label: 'Nanjing',
        children: [
          {
            value: 'zhonghuamen',
            label: 'Zhong Hua Men',
          },
        ],
      },
    ],
  },
]

const Example: React.VFC = () => {
  const [data, setData] = useState<Data[]>(() =>
    times(40, (key) => {
      return { key, isEdit: true, isNone: Math.random() > 0.9 }
    }),
  )

  const [show, setShow] = useState(true)
  const columns = useMemo(() => {
    type Item = ColumnsType<Data>[number]
    const result: (ColumnsType<Data>[number] | null)[] = [
      {
        dataIndex: '00',
        title: '序号',
        width: 100,
        fixed: 'left',
        render(val, row) {
          return row.key
        },
      },
      {
        key: 'placeholder1',
        width: 150,
        render() {
          return 'PLACEHOLDER1'
        },
      },
      {
        dataIndex: '3',
        title: '条件渲染',
        width: 240,
        render(val, row, index) {
          if (row.isNone) {
            return <span>None</span>
          }
          return (
            <div style={{ display: 'flex' }}>
              {!row.isEdit ? null : (
                <Form.Item name={[index, 'input']} noStyle>
                  <KeyboardFocus.Input focusKey="条件渲染">
                    <Input style={{ flexGrow: 1, marginRight: '1rem' }} />
                  </KeyboardFocus.Input>
                </Form.Item>
              )}
              <Button
                type="link"
                style={{
                  fontSize: 12,
                }}
                onClick={() => {
                  setData((rawData) => {
                    const res = slice(rawData)
                    res[index] = { ...row, isEdit: !row.isEdit }
                    return res
                  })
                }}
              >
                Toggle
              </Button>
            </div>
          )
        },
      },
      {
        dataIndex: '0',
        title: '多输入组件',
        width: 240,
        render(val, row, index) {
          if (row.isNone) {
            return <span>None</span>
          }
          const disabled = index === 5 || index === 7 || index === 8
          const disabledLeft = index === 4 || index === 9
          const disabledRight = index === 3 || index === 10

          return (
            <KeyboardFocus.Distribution focusKey="多输入组件">
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <Input.Group compact>
                  <Form.Item name={[index, 'input1']} noStyle>
                    <KeyboardFocus.Input x={0} focusKey="0">
                      <Input
                        style={{ width: '50%' }}
                        disabled={disabled || disabledLeft}
                        defaultValue={
                          disabled || disabledLeft ? 'DISABLED' : ''
                        }
                      />
                    </KeyboardFocus.Input>
                  </Form.Item>
                  <Form.Item name={[index, 'input2']} noStyle>
                    <KeyboardFocus.Input x={1} focusKey="1">
                      <Input
                        style={{ width: '50%' }}
                        disabled={disabled || disabledRight}
                        defaultValue={
                          disabled || disabledRight ? 'DISABLED' : ''
                        }
                      />
                    </KeyboardFocus.Input>
                  </Form.Item>
                </Input.Group>
              </div>
            </KeyboardFocus.Distribution>
          )
        },
      },
      !show
        ? null
        : {
            dataIndex: '1',
            title: '动态列',
            width: 200,
            render(val, row, index) {
              if (row.isNone) {
                return <span>None</span>
              }
              return (
                <Form.Item name={[index, 'number']} noStyle>
                  <KeyboardFocus.Input focusKey="动态列">
                    <InputNumber style={{ width: '100%' }} keyboard={false} />
                  </KeyboardFocus.Input>
                </Form.Item>
              )
            },
          },
      {
        dataIndex: '2',
        title: '下拉框',
        width: 240,
        render(val, row, index) {
          if (row.isNone) {
            return <span>None</span>
          }
          return (
            <Form.Item name={[index, 'select']} noStyle>
              <KeyboardFocus.AntdSelect focusKey="下拉框">
                <Select style={{ width: '100%' }}>
                  <Option value="jack">Jack</Option>
                  <Option value="lucy">Lucy</Option>
                  <Option value="Yiminghe">yiminghe</Option>
                </Select>
              </KeyboardFocus.AntdSelect>
            </Form.Item>
          )
        },
      },
      {
        key: 'placeholder2',
        width: 150,
        render() {
          return 'PLACEHOLDER2'
        },
      },
      {
        key: 'placeholder3',
        width: 150,
        render() {
          return 'PLACEHOLDER3'
        },
      },
      {
        key: 'placeholder4',
        width: 150,
        render() {
          return 'PLACEHOLDER3'
        },
      },
      {
        dataIndex: '4',
        title: '回车事件',
        width: 240,
        render(val, row, index) {
          if (row.isNone) {
            return <span>None</span>
          }
          const disabled = index === 3 || index === 6 || index === 9

          return (
            <Form.Item name={[index, 'enter']} noStyle>
              <KeyboardFocus.Input focusKey="回车事件">
                <Input
                  disabled={disabled}
                  placeholder="请按下回车"
                  onPressEnter={() => {
                    Modal.confirm({
                      content: '哈哈哈哈',
                    })
                  }}
                />
              </KeyboardFocus.Input>
            </Form.Item>
          )
        },
      },
      {
        dataIndex: '88',
        title: '级联',
        width: 200,
        render(val, row, index) {
          if (row.isNone) {
            return <span>None</span>
          }
          return (
            <Form.Item name={[index, 'cascader']} noStyle>
              <KeyboardFocus.AntdCascader focusKey="级联">
                <Cascader options={options} placeholder="Please select" />
              </KeyboardFocus.AntdCascader>
            </Form.Item>
          )
        },
      },
      {
        dataIndex: '5',
        title: '单选框',
        width: 270,
        render(val, row, index) {
          if (row.isNone) {
            return <span>None</span>
          }
          return (
            <KeyboardFocus.Distribution focusKey="单选框">
              <Form.Item name={[index, 'radio']} noStyle>
                <Radio.Group name={`${index}`}>
                  <KeyboardFocus.AntdRadio x={0} focusKey="0">
                    <Radio value={2}>下架</Radio>
                  </KeyboardFocus.AntdRadio>
                  <KeyboardFocus.AntdRadio x={1} focusKey="1">
                    <Radio value={1}>上架</Radio>
                  </KeyboardFocus.AntdRadio>
                </Radio.Group>
              </Form.Item>
            </KeyboardFocus.Distribution>
          )
        },
      },
      {
        dataIndex: 'action',
        title: '操作',
        width: 200,
        fixed: 'right',
        render(_val, _row, index) {
          return (
            <>
              <button
                type="button"
                style={{ fontSize: 14 }}
                onClick={() => {
                  setData((rawData) => {
                    const res = slice(rawData)
                    res.splice(index, 0, {
                      key: Date.now(),
                      isEdit: false,
                    })
                    return res
                  })
                }}
              >
                插入一行
              </button>
              <button
                type="button"
                style={{ fontSize: 14 }}
                onClick={() => {
                  setData((rawData) => {
                    const res = slice(rawData)
                    res.splice(index, 1)
                    return res
                  })
                }}
              >
                删除
              </button>
            </>
          )
        },
      },
    ]
    return filter(result, (item): item is Item => item !== null)
  }, [show])

  const keyboardFocusRef = useRef<KeyboardFocusContextRef | null>(null)
  const [focusIndex, { onBlur, onFocus }] = useFocusYAxis()

  return (
    <Form
      className="keyboard_focus_example"
      onFinish={(e) => {
        message.info('打开控制台查看表单内容')
        console.log(e)
      }}
    >
      <Button type="primary" htmlType="submit">
        表单提交
      </Button>
      <Button
        onClick={() => {
          setShow((v) => !v)
        }}
      >
        渲染“动态列”显示/隐藏
      </Button>
      <KeyboardFocus.AntdTable
        leftFixedWidth={100}
        rightFixedWidth={200}
        onFocus={onFocus}
        onBlur={onBlur}
        ref={keyboardFocusRef}
      >
        <Table
          dataSource={data}
          pagination={false}
          size="small"
          columns={columns}
          rowClassName={(_record, index) => {
            if (index === focusIndex) {
              return 'row-bg'
            }
            return ''
          }}
          scroll={{ x: '100%' }}
        />
      </KeyboardFocus.AntdTable>
    </Form>
  )
}

export default Example

/* eslint-disable jsx-a11y/label-has-associated-control */
import './index.less'

import { InfoCircleOutlined } from '@ant-design/icons'
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
  Space,
  Table,
  Tooltip,
} from 'antd'
import { ColumnType } from 'antd/lib/table/interface'
import { filter, isNil, slice, times, trim } from 'lodash-es'
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

const renderSkeleton = () => {
  return <div className="skeleton" />
}

const Example: React.VFC = () => {
  const [data, setData] = useState<Data[]>(() => [
    { key: -1, isEdit: true, isNone: false },
    ...times(39, (key) => {
      return { key, isEdit: true, isNone: Math.random() > 0.9 }
    }),
  ])

  const [show, setShow] = useState(true)
  const columns = useMemo(() => {
    const result: (ColumnType<Data> & { hide?: boolean })[] = [
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
        render: renderSkeleton,
      },
      {
        dataIndex: '3',
        title: '条件渲染',
        width: 240,
        render(val, row, index) {
          if (row.isNone) {
            return renderSkeleton()
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
            return renderSkeleton()
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
      {
        key: 'DISTRIBUTION_Y_MODE',
        title: 'YMode',
        width: 200,
        render() {
          return (
            <KeyboardFocus.Distribution mode="y" focusKey="YMode">
              <Space direction="vertical">
                <KeyboardFocus.Input y={0} focusKey="0">
                  <Input size="small" />
                </KeyboardFocus.Input>
                <KeyboardFocus.Input y={1} focusKey="1">
                  <Input size="small" />
                </KeyboardFocus.Input>
              </Space>
            </KeyboardFocus.Distribution>
          )
        },
      },
      {
        hide: !show,
        dataIndex: '1',
        title: '动态列',
        width: 200,
        render(val, row, index) {
          if (row.isNone) {
            return renderSkeleton()
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
            return renderSkeleton()
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
        render: renderSkeleton,
      },
      {
        key: 'placeholder3',
        width: 150,
        render: renderSkeleton,
      },
      {
        key: 'placeholder4',
        width: 150,
        render: renderSkeleton,
      },
      {
        dataIndex: '4',
        title: '回车事件',
        width: 240,
        render(val, row, index) {
          if (row.isNone) {
            return renderSkeleton()
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
            return renderSkeleton()
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
            return renderSkeleton()
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
    return filter(result, (item) => !item.hide) as ColumnType<Data>[]
  }, [show])

  const keyboardFocusRef = useRef<KeyboardFocusContextRef | null>(null)
  const [focusIndex, { onBlur, onFocus }] = useFocusYAxis()

  const [manual, setManual] = useState({
    dir: 'y',
    axisValue: 0 as number | undefined | null,
    key: '多输入组件,1' as string | undefined,
  })

  const handleManualFocus = () => {
    const { dir, axisValue, key } = manual
    const instance = keyboardFocusRef.current
    if (!instance || isNil(axisValue) || !key) return
    const focusKey = key.split(',')
    switch (dir) {
      case 'x': {
        instance.notifyVectorByKeyOnYAxis(focusKey, axisValue)
        break
      }
      case 'y': {
        instance.notifyVectorByKeyOnXAxis(focusKey, axisValue)
        break
      }
      // no default
    }
  }

  return (
    <Form
      className="keyboard_focus_example"
      onFinish={(e) => {
        message.info('打开控制台查看表单内容')
        console.log(e)
      }}
    >
      <h2>使用键盘方向键切换组件的焦点</h2>
      <Space style={{ marginBottom: 10 }}>
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
        <div className="field" style={{ marginLeft: 30 }}>
          <label className="field-label" htmlFor="manual">
            指定 key focus 组件：
          </label>
          <Space.Compact>
            <Input
              prefix="第"
              style={{ width: 80 }}
              value={manual.axisValue?.toString()}
              onChange={(e) => {
                const { value } = e.target
                const val = trim(value) === '' ? undefined : Number(trim(value))
                setManual((prev) => ({
                  ...prev,
                  axisValue: val,
                }))
              }}
            />
            <Select
              value={manual.dir}
              onChange={(e) => setManual((prev) => ({ ...prev, dir: e }))}
              options={[
                // { label: '列', value: 'x' },
                { label: '行', value: 'y' },
              ]}
            />
            <Input
              style={{ width: 180 }}
              id="manual"
              placeholder="key 值"
              value={manual.key}
              onChange={(e) =>
                setManual((prev) => ({ ...prev, key: e.target.value }))
              }
              suffix={
                <Tooltip title="表头 title 即为 key，多个 key 则使用逗号分隔。若一个 Cell 内有多个组件，则子组件 key 为从 0 开始的数字">
                  <InfoCircleOutlined />
                </Tooltip>
              }
            />
            <Button type="primary" onClick={handleManualFocus}>
              Focus
            </Button>
          </Space.Compact>
        </div>
      </Space>
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

import { Table, Button, Flex, Popconfirm, Tooltip } from "antd";
import { ScanOutlined } from "@ant-design/icons";

const getColumns = (onOpen, onDelete) => [
  { title: "文件名", dataIndex: "name", key: "name", width: 100 },
  { title: "路径", dataIndex: "path", key: "path" },
  {
    title: "操作",
    key: "action",
    width: 120,
    fixed: "right",
    render: (_, record) => (
      <>
        <Flex gap="small" align="flex-start" vertical>
          <Flex gap="small">
            <Button size="small" type="primary" onClick={() => onOpen(record)}>
              查看
            </Button>
            <Popconfirm
              title="确定删除该文件吗？"
              onConfirm={() => onDelete(record)}
            >
              <Button size="small" danger type="primary">
                删除
              </Button>
            </Popconfirm>
          </Flex>
        </Flex>
      </>
    ),
  },
];

const FileTable = ({ data, onOpen, onDelete, onRefresh }) => (
  <>
    <div style={{ textAlign: "right", marginBottom: 8 }}>
      <Tooltip title="扫描当前项目所有bot-coder生成的文件">
        <Button type="primary" icon={<ScanOutlined />} onClick={onRefresh}>
          扫描
        </Button>
      </Tooltip>
    </div>
    <Table
      dataSource={data}
      columns={getColumns(onOpen, onDelete)}
      pagination={false}
      size="small"
      rowKey="path"
      scroll={{ x: "max-content" }}
      className="mt-4"
    />
  </>
);

export default FileTable;

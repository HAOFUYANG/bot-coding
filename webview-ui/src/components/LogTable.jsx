import { Table } from "antd";

const columns = [
  { title: "序号", dataIndex: "count", key: "count", width: 50 },
  {
    title: "开始行",
    dataIndex: "prevLineCount",
    key: "prevLineCount",
    width: 70,
  },
  {
    title: "结束行",
    dataIndex: "newLineCount",
    key: "newLineCount",
    width: 80,
  },
  { title: "内容", dataIndex: "content", key: "content" },
];

const LogTable = ({ data }) => (
  <Table
    dataSource={data}
    columns={columns}
    pagination={false}
    size="small"
    rowKey="index"
    className="mt-4"
  />
);

export default LogTable;

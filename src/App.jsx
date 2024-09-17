import React, { useState } from "react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { Upload, Button, Radio, message } from "antd";
import { UploadOutlined } from "@ant-design/icons";

const UploadExcel = () => {
  const [file, setFile] = useState(null);
  const [format, setFormat] = useState(null); // 保存用户选择的文件格式
  function cleanString(str) {
    return str.replace(/['"\s]/g, "");
  }
  // 处理文件上传
  const handleFileUpload = ({ file }) => {
    setFile(file);
    message.success(`${file.name} uploaded successfully`);
  };

  // 处理格式选择
  const handleFormatChange = (e) => {
    setFormat(e.target.value);
  };

  // 解析 Excel 并生成 txt 文件
  const handleFileParse = () => {
    if (!file) {
      message.error("Please upload a file first.");
      return;
    }
    if (!format) {
      message.error("Please select a file format.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      const sheets = workbook.SheetNames;
      let txtContent = "";

      if (format === "format1") {
        // 处理第一种格式（一个 sheet）
        const sheet = workbook.Sheets[sheets[0]];
        const jsonData = XLSX.utils.sheet_to_json(sheet);
        console.log("处理的文件....");
        console.log(sheet);
        jsonData.forEach((row, index) => {
          txtContent += `题目${index + 1}：${row["标题"]}\n`;
          let options = "";
          let optionCount = 0;
          for (let key in row) {
            if (key.startsWith("选项")) {
              options += `${key.slice(2)}: ${row[key]}  `;
              optionCount++;

              // 每2个选项后换行
              if (optionCount % 2 === 0) {
                options += "\n";
              }
            }
          }
          txtContent += `${options}\n标准答案：${row["标准答案"]}\n\n`;
        });
      } else if (format === "format2") {
        // 处理第二种格式（两个 sheet）
        const sheet1 = XLSX.utils.sheet_to_json(workbook.Sheets[sheets[0]]);
        const sheet2 = XLSX.utils.sheet_to_json(workbook.Sheets[sheets[1]]);
        console.log("处理的文件....");
        console.log(sheet1);
        console.log(sheet2);
        sheet1.forEach((row1, index) => {
          txtContent += `案例${index + 1}：${row1["标题"]}\n`;

          const matchingRows = sheet2.filter(
            (row2) =>
              cleanString(row2["所属编号"].toString()) ===
              cleanString(row1["编号"].toString())
          );
          matchingRows.forEach((row2, idx) => {
            txtContent += `题目${idx + 1}：${row2["标题"]}\n`;
            let options = "";
            let optionCount = 0;
            for (let key in row2) {
              if (key.startsWith("选项")) {
                options += `${key.slice(2)}: ${row2[key]}  `;
                optionCount++;

                // 每2个选项后换行
                if (optionCount % 2 === 0) {
                  options += "\n";
                }
              }
            }
            txtContent += `${options}\n标准答案：${row2["标准答案"]}\n\n`;
          });
        });
      }
      // 获取 Excel 文件名并移除扩展名
      const fileNameWithoutExt = file.name.split(".").slice(0, -1).join(".");

      // 将 txt 内容保存为文件，文件名使用上传的 Excel 文件名
      const blob = new Blob([txtContent], { type: "text/plain;charset=utf-8" });
      saveAs(blob, `${fileNameWithoutExt}.txt`);
    };

    reader.readAsArrayBuffer(file);
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Excel 转换工具</h2>

      {/* 上传组件 */}
      <Upload
        accept=".xlsx, .xls"
        maxCount={1}
        beforeUpload={(file) => {
          setFile(file);
          return false; // 阻止自动上传，手动处理
        }}
        onRemove={() => setFile(null)}
      >
        <Button icon={<UploadOutlined />}>点击上传 Excel 文件</Button>
      </Upload>

      {/* 格式选择 */}
      <div style={{ marginTop: 20 }}>
        <Radio.Group onChange={handleFormatChange}>
          <Radio value="format1">选择题</Radio>
          <Radio value="format2">案例题</Radio>
        </Radio.Group>
      </div>

      {/* 生成txt文件的按钮 */}
      <div style={{ marginTop: 20 }}>
        <Button
          type="primary"
          onClick={handleFileParse}
          disabled={!file || !format}
        >
          生成txt文件
        </Button>
      </div>
    </div>
  );
};

export default UploadExcel;

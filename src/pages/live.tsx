import React, { useRef, useState } from "react";
import dynamic from 'next/dynamic';
import { ActionType, ProTable } from "@ant-design/pro-components";
import { Button, Modal, message, Upload, DatePicker } from "antd";
import { get, post } from '@/services/request';
import Layout from "@/components/Layout";
import type { ProColumns } from '@ant-design/pro-components';
import { PlusOutlined, UploadOutlined } from '@ant-design/icons';
import type { UploadFile } from 'antd/es/upload/interface';
import dayjs from 'dayjs';
import OSS from 'ali-oss';

const DynamicLivePage = () => {
  const ref = useRef<ActionType>(null);
  const authcodeRef = useRef<ActionType>(null);
  
  const [isClient, setIsClient] = useState(false);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [title, setTitle] = useState('');
  const [startDate, setStartDate] = useState<dayjs.Dayjs | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [uploadings, setUpLoadings] = useState<boolean>(false);

  // 编辑直播的状态
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editStartDate, setEditStartDate] = useState<dayjs.Dayjs | null>(null);
  const [editFileList, setEditFileList] = useState<UploadFile[]>([]);
  const [currentLive, setCurrentLive] = useState<any>(null);

  // 授权码管理的状态
  const [isAuthcodeModalOpen, setIsAuthcodeModalOpen] = useState(false);
  const [currentLiveForAuthcode, setCurrentLiveForAuthcode] = useState<any>(null);

  React.useEffect(() => {
    setIsClient(true);
  }, []);

  // OSS 客户端创建函数（可抽离）
  const createOSSClient = () => {
    return new OSS({
      region: 'oss-cn-hangzhou',
      accessKeyId: 'LTAI5tBQiy8LGgApruXyFjTt',
      accessKeySecret: 'slGM0QTo8l93fsVsKjwyEmUhK9wyYT',
      bucket: 'elive-faisal',
    });
  };

  // 添加直播
  const handleAdd = () => {
    setIsModalOpen(true);
  };
  const handleCancel = () => {
    setIsModalOpen(false);
  };

  // 提交添加直播
  const handleOk = async () => {
    if (!title || !startDate || fileList.length === 0) {
      message.error('请填写完整信息');
      return;
    }
    setUpLoadings(true);
    try {
      const client = createOSSClient();
      const file = fileList[0].originFileObj as File;
      const extension = file.name.split('.').pop() || 'mp4';
      
      // 创建一个URL对象来表示视频文件
      const videoUrl = URL.createObjectURL(file);
      const video = document.createElement('video');
      video.preload = 'metadata';

      // 监听loadedmetadata事件以获取视频时长
      video.onloadedmetadata = async () => {
        window.URL.revokeObjectURL(videoUrl);
        const videoDuration = video.duration;
        console.log(`视频时长: ${videoDuration} 秒`);

        // 文件名加时间戳避免重名
        const result = await client.put(`${file.name}${Date.now()}.${extension}`, file);

        await post('/api/addLive', {
          title,
          start_date: startDate.format('YYYY-MM-DD HH:mm:ss'),
          video_url: result.url,
          duration: videoDuration,
        });
        message.success('添加成功');
        // 重置状态
        setTitle('');
        setStartDate(null);
        setFileList([]);
        setIsModalOpen(false);
        ref.current?.reload();
      };

      video.src = videoUrl;
     
    } catch (error) {
      message.error('添加失败，请重试');
    }
    setUpLoadings(false);
  };

  // 编辑直播：打开编辑模态框并预填数据
  const handleEdit = (record: any) => {
    setCurrentLive(record);
    setEditTitle(record.title);
    setEditStartDate(dayjs(record.start_date));
    setEditFileList([]);
    setIsEditModalOpen(true);
  };

  // 提交编辑直播
  const handleEditOk = async () => {
    if (!editTitle || !editStartDate) {
      message.error('请填写完整信息');
      return;
    }
    setUpLoadings(true);
    try {
      let videoUrl = currentLive.video_url;
      // 若上传了新视频，则重新上传
      if (editFileList.length > 0) {
        const client = createOSSClient();
        const file = editFileList[0].originFileObj as File;
        const extension = file.name.split('.').pop() || 'mp4';
        const result = await client.put(`${file.name}${Date.now()}.${extension}`, file);
        videoUrl = result.url;
      }
      await post('/api/updateLive', {
        id: currentLive.id,
        title: editTitle,
        start_date: editStartDate.format('YYYY-MM-DD HH:mm:ss'),
        video_url: videoUrl,
      });
      message.success('更新成功');
      setIsEditModalOpen(false);
      ref.current?.reload();
    } catch (error) {
      message.error('更新失败，请重试');
    }
    setUpLoadings(false);
  };

  // 打开授权码管理模态框
  const handleAuthcode = (record: any) => {
    setCurrentLiveForAuthcode(record);
    setIsAuthcodeModalOpen(true);
  };

  // 添加新的授权码（调用后端生成或录入授权码）
  const handleAddAuthcode = async () => {
    if (!currentLiveForAuthcode) return;
    try {
      await post('/api/addAuthcode', { live_id: currentLiveForAuthcode.id });
      message.success('添加授权码成功');
      authcodeRef.current?.reload();
    } catch (error) {
      message.error('添加授权码失败');
    }
  };

  // 主表的列定义
  const columns: ProColumns<any>[] = [
    {
      title: '直播标题',
      dataIndex: 'title',
      key: 'title',
      align: 'center',
    },
    {
      title: '开始时间',
      dataIndex: 'start_date',
      key: 'start_date',
      valueType: 'dateTime',
      align: 'center',
    },
    {
      title: '视频链接',
      dataIndex: 'video_url',
      key: 'video_url',
      render: (dom: React.ReactNode, entity: any) => {
        const text = dom as string;
        return text ? <a href={text} target="_blank" rel="noopener noreferrer">查看视频</a> : '-';
      },
      align: 'center',
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      key: 'created_at',
      valueType: 'dateTime',
      align: 'center',
    },
    {
      title: '操作',
      valueType: 'option',
      align: 'center',
      render: (_, record) => [
        <Button
          key="edit"
          type="link"
          onClick={() => handleEdit(record)}
        >
          编辑
        </Button>,
        <Button
          key="authcode"
          type="link"
          onClick={() => handleAuthcode(record)}
        >
          授权码管理
        </Button>,
        <Button
          key="delete"
          type="link"
          danger
          onClick={() => {
            Modal.confirm({
              title: '确认删除',
              content: '确定要删除这个直播吗？',
              onOk: async () => {
                await post('/api/deleteLive', { id: record.id });
                message.success('删除成功');
                ref.current?.reload();
              },
            });
          }}
        >
          删除
        </Button>,
      ],
    },
  ];

  // 授权码表的列定义
  const authcode_columns: ProColumns<any>[] = [
    {
      title: '授权码',
      dataIndex: 'authcode',
      key: 'authcode',
      align: 'center',
    },
    {
      title: '使用人',
      dataIndex: 'user', // 假设后端返回的字段为 user（可根据实际情况调整）
      key: 'user',
      align: 'center',
      render: (text: any) => text ? text.name : '-',
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      key: 'created_at',
      valueType: 'dateTime',
      align: 'center',
    },
    {
      title: '操作',
      key: 'option',
      align: 'center',
      render: (_, record) => (
        <Button
          key="delete"
          type="link"
          danger
          onClick={() => {
            Modal.confirm({
              title: '确认删除',
              content: '确定要删除这个授权码吗？',
              onOk: async () => {
                await post('/api/deleteAuthcode', { id: record.id });
                message.success('删除成功');
                authcodeRef.current?.reload();
              },
            });
          }}
        >
          删除
        </Button>
      ),
    },
  ];

  return (
    <Layout>
      {isClient ? (
        <>
          <ProTable<any>
            actionRef={ref}
            columns={columns}
            pagination={{
              pageSize: 10,
            }}
            request={async (params) => {
              try {
                const response = await get('/api/lives', {
                  ...params,
                  pageSize: params.pageSize,
                  current: params.current,
                });
                return {
                  data: response.data.data || [],
                  success: true,
                  total: response.data.total || 0,
                };
              } catch (error) {
                return {
                  data: [],
                  success: false,
                  total: 0,
                };
              }
            }}
            rowKey="id"
            search={false}
            options={{
              density: true,
              fullScreen: true,
              reload: true,
              setting: true,
            }}
            toolBarRender={() => [
              <Button
                key="add"
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleAdd}
              >
                添加直播
              </Button>
            ]}
            dateFormatter="string"
            headerTitle=""
          />

          {/* 添加直播模态框 */}
          <Modal
            title="添加直播"
            open={isModalOpen}
            onOk={handleOk}
            onCancel={handleCancel}
            width={500}
            footer={[
              <Button key="back" onClick={handleCancel}>
                返回
              </Button>,
              <Button key="submit" type="primary" loading={uploadings} onClick={handleOk}>
                提交
              </Button>,
            ]}
          >
            <div style={{ marginTop: 20 }}>
              <div style={{ marginBottom: 16 }}>
                <div>直播标题：</div>
                <input
                  style={{ width: '100%', marginTop: 8 }}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
              <div style={{ marginBottom: 16 }}>
                <div>开始时间：</div>
                <DatePicker
                  style={{ width: '100%', marginTop: 8 }}
                  showTime
                  onChange={(date) => setStartDate(date)}
                />
              </div>
              <div>
                <div>上传视频：</div>
                <Upload
                  fileList={fileList}
                  onChange={({ fileList }) => setFileList(fileList)}
                  beforeUpload={() => false}
                >
                  <Button icon={<UploadOutlined />} >选择视频</Button>
                </Upload>
              </div>
            </div>
          </Modal>

          {/* 编辑直播模态框 */}
          <Modal
            title="编辑直播"
            open={isEditModalOpen}
            onOk={handleEditOk}
            onCancel={() => setIsEditModalOpen(false)}
            width={500}
            footer={[
              <Button key="back" onClick={() => setIsEditModalOpen(false)}>
                返回
              </Button>,
              <Button key="submit" type="primary" loading={uploadings} onClick={handleEditOk}>
                提交
              </Button>,
            ]}
          >
            <div style={{ marginTop: 20 }}>
              <div style={{ marginBottom: 16 }}>
                <div>直播标题：</div>
                <input
                  style={{ width: '100%', marginTop: 8 }}
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                />
              </div>
              <div style={{ marginBottom: 16 }}>
                <div>开始时间：</div>
                <DatePicker
                  style={{ width: '100%', marginTop: 8 }}
                  showTime
                  value={editStartDate}
                  onChange={(date) => setEditStartDate(date)}
                />
              </div>
              <div>
                <div>上传新视频（可选）：</div>
                <Upload
                  fileList={editFileList}
                  onChange={({ fileList }) => setEditFileList(fileList)}
                  beforeUpload={() => false}
                >
                  <Button icon={<UploadOutlined />} >选择视频</Button>
                </Upload>
                {currentLive && !editFileList.length && (
                  <div style={{ marginTop: 8, color: '#999' }}>
                    当前视频：<a href={currentLive.video_url} target="_blank" rel="noopener noreferrer">查看视频</a>
                  </div>
                )}
              </div>
            </div>
          </Modal>

          {/* 授权码管理模态框 */}
          <Modal
            title={`授权码管理【${currentLiveForAuthcode?.title || ''}】`}
            open={isAuthcodeModalOpen}
            onCancel={() => setIsAuthcodeModalOpen(false)}
            footer={[
              <Button key="back" onClick={() => setIsAuthcodeModalOpen(false)}>
                关闭
              </Button>,
            ]}
            width={700}
          >
            <ProTable<any>
              actionRef={authcodeRef}
              columns={authcode_columns}
              request={async (params) => {
                if (!currentLiveForAuthcode) {
                  return { data: [], success: false, total: 0 };
                }
                try {
                  const response = await get('/api/getAuthcodes', {
                    live_id: currentLiveForAuthcode.id,
                    ...params,
                  });
                  return {
                    data: response.data || [],
                    success: true,
                    total: response.total || 0,
                  };
                } catch (error) {
                  return {
                    data: [],
                    success: false,
                    total: 0,
                  };
                }
              }}
              rowKey="id"
              search={false}
              options={false}
              toolBarRender={() => [
                <Button key="addAuthcode" type="primary" onClick={handleAddAuthcode}>
                  添加授权码
                </Button>,
              ]}
              pagination={{
                pageSize: 5,
              }}
            />
          </Modal>
        </>
      ) : null}
    </Layout>
  );
};

// 使用动态导入避免 SSR 问题
const LivePage = dynamic(() => Promise.resolve(DynamicLivePage), {
  ssr: false,
});

export default LivePage;

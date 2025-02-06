
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
    const [isClient, setIsClient] = useState(false);
    const [fileList, setFileList] = useState<UploadFile[]>([]);
    const [title, setTitle] = useState('');
    const [startDate, setStartDate] = useState<dayjs.Dayjs | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [uploadings, setUpLoadings] = useState<boolean>(false);
    const handleAdd = () => {
        setIsModalOpen(true);
    };
    const handleCancel = () => {
        setIsModalOpen(false);
    };


    React.useEffect(() => {
        setIsClient(true);
    }, []);

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

    const handleOk = async () => {

        if (!title || !startDate || fileList.length === 0) {
            message.error('请填写完整信息');
            return;
        }
        setUpLoadings(true);
        const client = new OSS({
            region: 'oss-cn-hangzhou',
            accessKeyId: 'LTAI5tBQiy8LGgApruXyFjTt',
            accessKeySecret: 'slGM0QTo8l93fsVsKjwyEmUhK9wyYT',
            bucket: 'elive-faisal',
        });
        const file = fileList[0].originFileObj as File;
        const extension = file.name.split('.').pop() || 'mp4';
        const result = await client.put(`${file.name}${Date.now()}.${extension}`, file);

        await post('/api/addLive', {
            title,
            start_date: startDate.format('YYYY-MM-DD HH:mm:ss'),
            video_url: result.url,
        })
        message.success('添加成功');
        setTitle('');
        setStartDate(null);
        setFileList([]);
        setIsModalOpen(false);
        setUpLoadings(false);
        ref.current?.reload();
    }


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
                                console.log("response==>", response);

                                return {
                                    data: response.data.data || [],
                                    success: true,
                                    total: response.data.total || 0
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
                    <Modal
                        title="添加直播"
                        open={isModalOpen}
                        onOk={handleOk}
                        onCancel={handleCancel}
                        width={500}
                        footer={
                            [
                                <Button key="back" onClick={handleCancel}>
                                    返回
                                </Button>,
                                <Button key="submit" type="primary" loading={uploadings} onClick={handleOk}>
                                    提交
                                </Button>,
                            ]
                        }
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
                </>
            ) : null}
        </Layout>
    );
};

// 使用动态导入避免 SSR 问题
const LivePage = dynamic(() => Promise.resolve(DynamicLivePage), {
    ssr: false
});

export default LivePage;
import { useEffect, useState } from 'react';
import { Typography, Space, message } from 'antd';
import { friendlinkType, friendlinkList } from '../../api/friendlink';

export const FriendLinkList = () => {
    const [friendlinks, setFriendlinks] = useState<friendlinkType[]>([]);

    const fetchFriendlinks = async () => {
        try {
            const res = await friendlinkList();
            setFriendlinks(res.data.list);
        } catch (error) {
            message.error("获取友链列表失败");
        }
    };

    useEffect(() => {
        fetchFriendlinks();
    }, []);

    return (
        <div className="bg-white">
            <div className="p-8">
                <Typography.Title level={5} className="mb-8 text-xl font-semibold text-gray-800 flex items-center">
                    <span className="mr-3 text-2xl">🔗</span>
                    <span className="bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                        友情链接
                    </span>
                </Typography.Title>
                <div className="flex flex-col gap-2">
                    {friendlinks.map((link) => (
                        <a
                            key={link.id}
                            href={link.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-6 py-2 text-gray-600 w-full  
                                     hover:text-gray-900 hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100
                                     text-base font-medium transition-all duration-300
                                     flex items-center gap-2 hover:shadow-sm"
                        >
                            {link.name}
                        </a>
                    ))}
                </div>
            </div>
        </div>
    );
};

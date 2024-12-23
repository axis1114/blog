import { message } from "antd";
import { useEffect, useState } from "react";
import { friendlinkList, friendlinkType } from "../../api/friendlink";

export const FriendLinkList = () => {
  const [friendlinks, setFriendlinks] = useState<friendlinkType[]>([]);
  const [loading, setLoading] = useState(true);
  const fetchFriendlinks = async () => {
    try {
      setLoading(true);
      const res = await friendlinkList({ page: 1, page_size: 100 });
      if (res.code === 0) {
        setFriendlinks(res.data.list);
      } else {
        message.error(res.message);
      }
    } catch (error) {
      console.error("获取友链列表失败:", error);
      message.error("获取友链列表失败");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFriendlinks();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="bg-white">
      <div className="p-8">
        <h5 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
          <span className="mr-2">🔗</span>友链
        </h5>
        <div className="flex flex-col gap-2">
          {friendlinks.map((link) => (
            <a
              key={link.id}
              href={link.link}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-2 text-gray-600 w-full  
                                     text-base font-medium 
                                     flex items-center gap-2"
            >
              {link.name}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
};

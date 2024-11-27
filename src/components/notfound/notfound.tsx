import { useNavigate } from 'react-router-dom';

export const NotFound = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen flex items-center justify-center bg-neutral-50">
            <div className="text-center max-w-md mx-4 p-16">
                {/* 404数字 */}
                <h1 className="text-[160px] font-extralight text-neutral-900 tracking-tighter leading-none
                             border-b border-neutral-200 pb-8">
                    404
                </h1>

                {/* 错误信息 */}
                <div className="mt-8 space-y-2">
                    <h2 className="text-2xl font-light text-neutral-800 tracking-wide">
                        页面未找到
                    </h2>
                    <p className="text-sm text-neutral-500 tracking-wider">
                        抱歉，您访问的页面不存在
                    </p>
                </div>

                {/* 返回按钮 */}
                <button
                    onClick={() => navigate('/')}
                    className="mt-12 px-12 py-4 text-sm tracking-widest
                             border-[1.5px] border-neutral-900
                             text-neutral-900
                             hover:bg-neutral-900 hover:text-white
                             transition-colors duration-300"
                >
                    返回首页
                </button>

                {/* 装饰线条 */}
                <div className="mt-16 flex justify-center space-x-2">
                    <div className="w-8 h-[1px] bg-neutral-300"></div>
                    <div className="w-2 h-[1px] bg-neutral-300"></div>
                    <div className="w-1 h-[1px] bg-neutral-300"></div>
                </div>
            </div>
        </div>
    );
};

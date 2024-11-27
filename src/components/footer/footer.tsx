export const Footer = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="w-full py-8 bg-white border-2 border-gray-300">
            <div className="max-w-7xl mx-auto px-4">
                <div className="flex flex-col  justify-between items-center">
                    <div className="text-gray-500 text-sm">
                        <p>© {currentYear} NSXZ 溺水寻舟的博客. All rights reserved.</p>
                    </div>
                </div>
            </div>
        </footer>
    );
};

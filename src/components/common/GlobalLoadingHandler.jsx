import { useEffect, useRef } from 'react';
import NProgress from 'nprogress';
import useUiStore from '../../store/uiStore';

NProgress.configure({ 
    showSpinner: false, 
    speed: 400,
    minimum: 0.2
});

const GlobalLoadingHandler = () => {
    const apiCount = useUiStore(state => state.apiCount);
    const prevCountRef = useRef(0);

    useEffect(() => {
        const prevCount = prevCountRef.current;
        
        // CHỈ start khi bắt đầu từ 0 lên (tránh việc reset thanh bar khi có thêm request mới)
        if (prevCount === 0 && apiCount > 0) {
            NProgress.start();
        } 
        
        // CHỈ done khi thực sự hết sạch request (về lại 0)
        if (prevCount > 0 && apiCount === 0) {
            NProgress.done();
        }

        // Cập nhật giá trị cũ
        prevCountRef.current = apiCount;
    }, [apiCount]);

    return null;
};

export default GlobalLoadingHandler;

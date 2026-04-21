import React, { useState, useEffect, memo } from 'react';
import ConstantList from '../../appConfig';

/**
 * UiAvatar - A modernized version of GlobitsAvatar.
 * Preserves 100% of the original logic for image path construction, 
 * error handling, and fallback initials.
 */

const UiAvatar = React.forwardRef(({ name, imgPath, isFile, style, className }, ref) => {
    const [errorLinkImg, setErrorLinkImg] = useState(false);

    const getImageNameAndType = (name) => {
        if (name) {
            const parts = name.split(".");
            return parts[0] + "/" + (parts[1] || "");
        }
        return "";
    };

    const getLastName = (name) => {
        if (name) {
            return name.split(" ").pop().charAt(0);
        }
        return "";
    };

    useEffect(() => {
        setErrorLinkImg(false);
    }, [isFile, imgPath]);

    // Premium styling for the fallback div to match the new UI
    const defaultStyle = {
        backgroundColor: '#5899ca7d',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#fff',
        fontWeight: 'bold',
        fontSize: '16px',
        ...style
    };

    if (imgPath && !errorLinkImg) {
        if (isFile) {
            return (
                <img 
                    ref={ref}
                    style={{ ...style }} 
                    className={`${className || ''} avatar-new rounded-full object-cover`} 
                    src={imgPath} 
                    alt="..." 
                    onError={() => setErrorLinkImg(true)} 
                />
            );
        }
        const linkImg = (ConstantList?.API_ENPOINT || "") + "/public/hr/file/getImage/" + getImageNameAndType(imgPath);
        return (
            <img 
                ref={ref}
                style={{ ...style }} 
                className={`${className || ''} avatar-new rounded-full object-cover`} 
                alt="avatar" 
                src={linkImg} 
                onError={() => setErrorLinkImg(true)} 
            />
        );
    } else {
        return (
            <div 
                ref={ref}
                className={`${className || ''} avatar-new rounded-full flex items-center justify-center`} 
                style={defaultStyle}
            >
                {name ? getLastName(name) : 'NS'}
            </div>
        );
    }
});

export default memo(UiAvatar);

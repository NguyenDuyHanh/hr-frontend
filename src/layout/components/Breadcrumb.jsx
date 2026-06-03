import React, { Fragment } from "react";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { useLocation } from "react-router-dom";
import { getBreadcrumbByPath } from "@/navigationConfig";

const Breadcrumb = () => {
  const location = useLocation();
  const routeSegments = getBreadcrumbByPath(location.pathname);
  const displayTitle = routeSegments && routeSegments.length > 1 ? routeSegments[routeSegments.length - 1].name : "";

  return (
    <div className="flex items-center justify-between h-15 py-4 bg-transparent">
      <div className="text-[18px] text-primary uppercase font-normal">
        {displayTitle}
      </div>

      <div className="flex items-center text-[12px]">
        {routeSegments &&
          routeSegments.length > 0 &&
          routeSegments.map((route, index) => (
            <Fragment key={index}>
              {index > 0 && (
                <span className="flex items-center text-muted-foreground/40 mx-1">
                  <ChevronRightIcon style={{ fontSize: "16px" }} />
                </span>
              )}
              <span className={`font-normal ${index === 0 ? "text-primary" : "text-primary"}`}>
                {route.name}
              </span>
            </Fragment>
          ))}
      </div>
    </div>
  );
};

export default Breadcrumb;

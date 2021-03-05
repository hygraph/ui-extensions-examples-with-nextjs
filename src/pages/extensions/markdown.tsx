import * as React from "react";
import Editor from "rich-markdown-editor";

import MDX from "@mdx-js/runtime";

export default function markDownExtension() {
  const [isExpanded, expandField] = React.useState(false);
  const [value, onChange] = React.useState("");

  return (
    <div
      style={{
        height: isExpanded ? "100vh" : "auto",
      }}
    >
      <div style={{ padding: "16px", borderBottom: "1px solid grey" }}>
        <button onClick={() => expandField(!isExpanded)}>
          {isExpanded ? "Reduce" : "Expand"}{" "}
        </button>
      </div>
      <div
        style={{
          display: "flex",
          width: "100%",
          height: isExpanded ? "100%" : "auto",
        }}
      >
        <div style={{ padding: "32px", flexGrow: 1, flexShrink: 1 }}>
          <Editor id="IDD" onChange={onChange} />
        </div>
        {isExpanded && (
          <div
            style={{
              padding: "32px",
              borderLeft: "1px solid black",
              flexGrow: 1,
              flexShrink: 1,
            }}
          >
            <MDX children={value} />
          </div>
        )}
      </div>
    </div>
  );
}

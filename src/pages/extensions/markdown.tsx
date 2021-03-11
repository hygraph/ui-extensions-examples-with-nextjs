import * as React from "react";
import Editor from "rich-markdown-editor";

import MDX from "@mdx-js/runtime";

import {
  ExtensionDeclaration,
  FieldExtensionFeature,
  FieldExtensionType,
  useUiExtension,
  Wrapper,
} from "@graphcms/uix-react-sdk";

const declaration: ExtensionDeclaration = {
  extensionType: "field",
  fieldType: FieldExtensionType.STRING,
  name: "Mardown based on rich-markdown-editor",
  features: [FieldExtensionFeature.FieldRenderer],
};

export default function ExtensionPage({ extensionUid }) {
  if (typeof extensionUid !== "string") return <p>missing extension uid</p>;
  return (
    <Wrapper uid={extensionUid} declaration={declaration}>
      <MarkDownExtension />
    </Wrapper>
  );
}

function MarkDownExtension() {
  // const [isExpanded, expandField] = React.useState(false);
  // const [value, onChange] = React.useState("");

  const {
    value,
    onChange,
    isExpanded,
    expandField,
    extension: { status },
    form: { getFieldState, getState, change },
  } = useUiExtension();

  return (
    <div
      style={{
        height: isExpanded ? "100vh" : "auto",
        minHeight: "200px",
      }}
    >
      <div style={{ padding: "16px", borderBottom: "1px solid grey" }}>
        <button onClick={() => expandField(!isExpanded)}>
          {isExpanded ? "Reduce" : "Expand"}{" "}
        </button>
        <button
          onClick={() =>
            getState().then((state) => console.log({ formState: state }))
          }
        >
          Log form state
        </button>
      </div>
      <div
        style={{
          display: "flex",
          width: "100%",
          height: isExpanded ? "100%" : "auto",
        }}
      >
        <div
          style={{ padding: "32px", flexGrow: 0, flexShrink: 0, width: "50%" }}
        >
          <Editor
            id="IDD"
            onChange={(getValue) => {
              onChange(getValue());
            }}
            defaultValue={value}
          />
        </div>
        {isExpanded && (
          <div
            style={{
              padding: "32px",
              borderLeft: "1px solid black",
              flexGrow: 0,
              flexShrink: 0,
              width: "50%",
            }}
          >
            <MDX children={value} />
          </div>
        )}
      </div>
    </div>
  );
}

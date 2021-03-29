import * as React from "react";
import {
  Wrapper as ExtensionWrapper,
  useUiExtension,
} from "@graphcms/uix-react-sdk";

import enTranslations from "@shopify/polaris/locales/en.json";
import {
  AppProvider,
  Page,
  ResourceList,
  ResourceItem,
  Thumbnail,
  Spinner,
  Badge,
} from "@shopify/polaris";

export default function ShopifyPicker({ extensionUid }) {
  console.log({ extensionUid });
  if (typeof extensionUid !== "string") return <p> missing extension UID</p>;
  return (
    <ExtensionWrapper
      uid={extensionUid}
      // @ts-expect-error
      declaration={{}}
    >
      <ProductPicker />
    </ExtensionWrapper>
  );
}

function ProductPicker() {
  const {
    extension: {
      config: { STORE, ACCESS_TOKEN },
    },
  } = useUiExtension();

  const { data, loading, error } = useFetchProducts({
    store: STORE,
    accessToken: ACCESS_TOKEN,
  });
  return (
    <AppProvider i18n={enTranslations}>
      <Page title="Product picker">
        {loading && (
          <React.Fragment>
            <Spinner />
          </React.Fragment>
        )}
        {data && (
          <ResourceList
            items={data}
            renderItem={(item: any) => {
              const { id, title, status, featuredImage } = item;
              return (
                <ResourceItem
                  id={id}
                  onClick={async () => {
                    const PostRobot = (await import("post-robot")).default;
                    PostRobot.send(window.opener, "selectItem", { id }).then(
                      function () {
                        window.close();
                      }
                    );
                  }}
                  media={
                    <Thumbnail
                      source={featuredImage?.transformedSrc}
                      alt="avatar"
                      size="small"
                    />
                  }
                >
                  {title}{" "}
                  <Badge
                    status={
                      status === "ACTIVE"
                        ? "success"
                        : status === "DRAFT"
                        ? "warning"
                        : undefined
                    }
                  >
                    {status}
                  </Badge>
                </ResourceItem>
              );
            }}
          />
        )}
      </Page>
    </AppProvider>
  );
}

function useFetchProducts({ store, accessToken }) {
  const [state, setState] = React.useState({
    loading: true,
    error: null,
    data: null,
  });
  React.useEffect(() => {
    if (typeof window !== "undefined") {
      window
        .fetch("/api/extensions/shopify/products", {
          method: "GET",
          headers: {
            "X-Shopify-Store": store,
            "X-Shopify-Access-Token": accessToken,
          },
        })
        .then((res) => {
          if (res.ok) {
            return res.json();
          } else {
            throw new Error(
              `Failed fetching products: ${res.status} ${res.body}`
            );
          }
        })
        .then((data) => {
          setState({
            loading: false,
            error: null,
            data: data.data.products.edges.map((e) => e.node),
          });
        })
        .catch((error) => setState({ loading: false, error, data: null }));
    }
  }, []);
  return state;
}

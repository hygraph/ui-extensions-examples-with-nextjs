import * as React from "react";
import "@shopify/polaris/dist/styles.css";
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
  const [config, setConfig] = React.useState({
    STORE: null,
    ACCESS_TOKEN: null,
  });

  React.useEffect(() => {
    let listener;
    const listenForItem = async function () {
      const postRobot = (await import("post-robot")).default;
      listener = postRobot.on("config", (event) => {
        const { STORE, ACCESS_TOKEN } = event.data;
        setTimeout(() => setConfig({ STORE, ACCESS_TOKEN }), 100);
        return true;
      });
    };
    listenForItem();
    return () => {
      listener.cancel();
    };
  }, []);

  if (typeof config.STORE !== "string") return <p></p>;
  return (
    <ProductPicker store={config.STORE} accessToken={config.ACCESS_TOKEN} />
  );
}

function ProductPicker({ store, accessToken }) {
  const { data, loading, error } = useFetchProducts({
    store,
    accessToken,
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

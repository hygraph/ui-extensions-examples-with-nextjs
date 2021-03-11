import * as React from "react";

import "@shopify/polaris/dist/styles.css";
import {
  Wrapper as ExtensionWrapper,
  useUiExtension,
  ExtensionDeclaration,
  FieldExtensionType,
  FieldExtensionFeature,
} from "@graphcms/uix-react-sdk";

import enTranslations from "@shopify/polaris/locales/en.json";
import {
  AppProvider,
  TextField,
  Button,
  Spinner,
  MediaCard,
  Card,
  Thumbnail,
  DisplayText,
} from "@shopify/polaris";

const extensionDeclaration: ExtensionDeclaration = {
  extensionType: "field",
  name: "Shopify Product Picker",
  fieldType: FieldExtensionType.STRING,
  features: [FieldExtensionFeature.FieldRenderer],
  config: {
    STORE: {
      type: "string",
      displayName: "Store ID",
      required: true,
    },
    ACCESS_TOKEN: {
      type: "string",
      displayName: "Access Token",
      required: true,
    },
  },
};

export default function ShopifyExtension({ extensionUid }) {
  console.log({ extensionUid });
  if (typeof extensionUid !== "string") return <p> missing extension UID</p>;
  return (
    <ExtensionWrapper uid={extensionUid} declaration={extensionDeclaration}>
      <ShopifyProductInput />
    </ExtensionWrapper>
  );
}

/// ok let's make an extension out of this
function ShopifyProductInput() {
  const {
    value,
    onChange,
    extension: {
      config: { STORE, ACCESS_TOKEN },
    },
  } = useUiExtension();

  React.useEffect(() => {
    let listener;
    const listenForItem = async function () {
      const postRobot = (await import("post-robot")).default;
      listener = postRobot.on("selectItem", (event) => {
        const id = event.data.id;
        setTimeout(() => onChange(id), 100);
        return true;
      });
    };
    listenForItem();
    return () => {
      listener.cancel();
    };
  }, []);

  const openPicker = React.useCallback(() => {
    const windowFeatures =
      "menubar=yes,resizable=yes,scrollbars=yes,status=yes,width=320,height=640";
    const pickerWindow = window.open(
      "shopify/picker",
      "Shopify_Picker",
      windowFeatures
    );
  }, []);

  return (
    <AppProvider i18n={enTranslations}>
      <div>
        <TextField
          value={value}
          label={undefined}
          onChange={onChange}
          connectedRight={<Button onClick={openPicker}>open picker</Button>}
        />
        <ProductPreview
          productId={value}
          store={STORE}
          accessToken={ACCESS_TOKEN}
        />
      </div>
    </AppProvider>
  );
}

function useThrottledfunction(callback, delay) {
  const savedCallback = React.useRef();
  const savedArgs = React.useRef([]);
  const timeoutId = React.useRef(null);

  React.useEffect(() => (savedCallback.current = callback), [callback]);

  const dummyFunction = React.useCallback(
    (...args) => {
      if (timeoutId.current) {
        clearTimeout(timeoutId.current);
      }
      timeoutId.current = setTimeout(() => {
        //@ts-ignore
        savedCallback.current(...savedArgs.current);
      }, delay);
      savedArgs.current = args;
    },
    [callback]
  );

  return dummyFunction;
}

function ProductPreview({
  productId,
  store,
  accessToken,
}: {
  productId: string;
  store: string;
  accessToken: string;
}) {
  const [state, setState] = React.useState({
    loading: false,
    error: null,
    data: null,
  });
  const fetchProduct = React.useCallback(
    (productId) => {
      if (typeof window !== "undefined") {
        setState({ loading: true, error: null, data: null });
        window
          .fetch(
            `/api/extensions/shopify/product/${encodeURIComponent(productId)}`,
            {
              method: "GET",
              headers: {
                "X-Shopify-Store": store,
                "X-Shopify-Access-Token": accessToken,
              },
            }
          )
          .then((res) => {
            if (res.ok) {
              res.json().then((data) => {
                if (data.data.product)
                  setState({
                    loading: false,
                    error: null,
                    data: data?.data?.product,
                  });
                else
                  setState({
                    loading: false,
                    error: new Error("Product not found"),
                    data: null,
                  });
              });
            } else {
              setState({
                loading: false,
                error: new Error(res.statusText),
                data: null,
              });
            }
          })
          .catch((error) => setState({ loading: false, error, data: null }));
      }
    },
    [store, accessToken]
  );

  const throttledFetchProduct = useThrottledfunction(fetchProduct, 100);
  React.useEffect(() => {
    if (productId.startsWith("gid://shopify/Product/"))
      throttledFetchProduct(productId);
    else
      setState({
        loading: false,
        error: null,
        data: null,
      });
  }, [productId]);
  return state.loading ? (
    <Card>
      <Spinner />
    </Card>
  ) : (
    <React.Fragment>
      {state.data && (
        <div style={{ padding: "12px" }}>
          <Card>
            <div style={{ display: "flex" }}>
              <Thumbnail
                source={state.data.featuredImage?.transformedSrc}
                alt="product image"
                size="medium"
              />
              <DisplayText size="small">{state.data.title}</DisplayText>
            </div>
          </Card>
        </div>
      )}
      {state.error && <p style={{ color: "red" }}>{state.error.message}</p>}
    </React.Fragment>
  );
}

import type { NextApiRequest, NextApiResponse } from 'next';
import fetch from 'node-fetch';

export default async function (req: NextApiRequest, res: NextApiResponse) {
  const store = req.headers['x-shopify-store'];
  const accessToken = req.headers['x-shopify-access-token'] as string;
  const {
    query: { productId }
  } = req;
  console.log({productId})
  const result = await fetch(
    `https://${store}.myshopify.com/admin/api/2020-10/graphql.json`, {
    method: 'POST',
    headers: {
      'X-Shopify-Access-Token': accessToken,
      'Content-Type': 'application/graphql',
    },
    body: `
      {
        product(id: "${productId}") {
          id
          handle
          title
          status
          featuredImage {
            originalSrc
            transformedSrc
          }
        }
      }
    `
  }).then(res => {
    return res.json() })
  res.json(result);
}

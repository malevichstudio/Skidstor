export const getProductsShopsCategoriesTotalItems = ({
  products,
  categories,
  shops,
}) => {
  const result = [];

  products?.forEach((product) => {
    result.push({
      icon: product?.image,
      text: product?.name,
      id: product?.id,
      price: product?.price,
      type: 'product',
    });
  });
  categories?.forEach((category, index) => {
    result.push({
      text: category?.name,
      id: category?.id,
      type: 'category',
      line: !index ? true : false,
    });
  });
  shops?.forEach((shop, index) => {
    result.push({
      text: shop?.name,
      id: shop?.id,
      type: 'shop',
      line: !index ? true : false,
    });
  });
  return result;
};

export const routesResults = (type) => {
  if (type === 'product') {
    return '/product';
  }
  if (type === 'category') {
    return '/category';
  }
  if (type === 'shop') {
    return '/shop';
  }
};

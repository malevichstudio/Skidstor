import { useLazyQuery } from '@apollo/client';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import { useDispatch, useSelector } from 'react-redux';

import {
  Footer,
  Header,
  NavigationMenu,
  Product,
  SortFilter,
} from '../../components';
import Loader from '../../components/Loader/Loader';
import RequestLoader from '../../components/Loader/RequestLoader';
import { RATING_TO } from '../../constants/constants';
import {
  PRODUCTS_QUERY,
  GET_CATEGORY_PRODUCTS_QUERY,
  FILTER_CATEGORY_QUERY,
} from '../../graphql/queries';
import { useIntl } from '../../hooks';
import {
  useCategoriesProductsQuery,
  useFilterCategoryQuery,
  useShopsSearchQuery,
} from '../../hooks/useQueries';
import {
  setFetching,
  setPage,
  setPrice,
  setRating,
  setShopId,
  setSort,
  //
  setProducts,
  setPagionsInfo,
  setShopSearch,
  setOffersProducts,
  setOffersPagionsInfo,
  setActiveCategory as reduxSetActiveCategory,
} from '../../redux/reducers/categoriesProducts';
import { categoriesProductsSelector } from '../../redux/selectors';
import { client } from '../../client/client';
import { useCategoriesContext } from '../../context/CategoriesContext';
import MetaLayout from '../../components/MetaLayout/MetaLayout';
import {
  CategoryItemList,
  CategoryItemsSection,
  CategorySection,
  CategoryTagShops,
  CategoryTagShopsWrapper,
  CategoryTitle,
  LoaderWrapper,
  TagShop,
} from './styles';

function CategoryPage({
  products: serverProducts,
  categoriesFilterData,
  paginationInfo,
  searhShopData: serverSearchShopData,
  categoryData: serverCategoryData,
}) {
  const router = useRouter();
  const id = router.query.id;
  const {
    activeCategory: activeCategoryContext,
    setActiveCategory: setActiveCategoryContext,
    setCategoryName: setCategoryNameContext,
  } = useCategoriesContext();

  const { intl } = useIntl();
  const dispatch = useDispatch();

  const subcategoryId = router?.query?.subcategoryId;
  const categoryName = activeCategoryContext?.categoryName;

  const {
    fetching,
    priceValue,
    sort,
    shopId,
    rating,
    activeCategory: reduxActiveCategory,
    products: reduxProducts,
    paginationInfo: reduxPaginationInfo,
    shopSearch: reduxShopSearch,
    offersProfuct: reduxOffersProfuct,
    offersPaginationInfo: reduxOffersPaginationInfo,
  } = useSelector(categoriesProductsSelector);

  const [activeSubcategory, setActiveSubcategory] = useState({
    id: reduxActiveCategory || subcategoryId || id,
  });

  const [query, { data, loading, fetchMore, updateQuery }] =
    useCategoriesProductsQuery();
  const [
    offersQuery,
    {
      loading: offersLoading,
      data: offersData,
      updateQuery: offersUpdateQuery,
    },
  ] = useLazyQuery(PRODUCTS_QUERY);

  const [
    searchShopQuery,
    {
      loading: searchShopLoading,
      data: searhShopData,
      updateQuery: shopsUpdateQuery,
    },
  ] = useShopsSearchQuery();

  const initialQuery = useRef();
  const initialraitingQuery = useRef();
  const initialSortQuery = useRef();

  const [shopChange, setShopChange] = useState(false);

  useEffect(() => {
    data && dispatch(setProducts({ products: data?.productSearch?.items }));
    data &&
      dispatch(
        setPagionsInfo({ paginationInfo: data?.productSearch?.paginationInfo }),
      );
  }, [data]);

  useEffect(() => {
    searhShopData &&
      dispatch(setShopSearch({ shopSearch: searhShopData?.shopSearch }));
  }, [searhShopData]);

  useEffect(() => {
    offersData &&
      dispatch(
        setOffersProducts({ products: offersData?.productSearch?.items }),
      );
    offersData &&
      dispatch(
        setOffersPagionsInfo({
          paginationInfo: offersData?.productSearch?.paginationInfo,
        }),
      );
  }, [offersData]);

  useEffect(() => {
    activeSubcategory &&
      dispatch(reduxSetActiveCategory({ activeCategory: activeSubcategory }));
  }, [activeSubcategory]);

  useEffect(() => {}, [offersData]);

  useEffect(() => {
    dispatch(setPage({ productPage: 1 }));
    offersUpdateQuery(() => {
      return {
        productSearch: {
          paginationInfo: reduxOffersPaginationInfo || paginationInfo,
          items: reduxOffersProfuct || serverProducts,
        },
      };
    });

    shopsUpdateQuery(() => {
      return {
        shopSearch: reduxShopSearch || serverSearchShopData,
      };
    });

    updateQuery(() => {
      return {
        productSearch: {
          paginationInfo: reduxPaginationInfo || paginationInfo,
          items: reduxProducts || serverProducts,
        },
      };
    });

    const min = +categoriesFilterData?.fields[0].intMin;
    const max = +categoriesFilterData?.fields[0].intMax;

    dispatch(
      setPrice({
        priceValue: {
          max: priceValue?.max || max,
          min: priceValue?.min || min,
          inputMin: +min,
          inputMax: +max,
        },
      }),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [updateQuery, id]);

  const totalCount = data?.productSearch?.paginationInfo?.totalItems;
  const productPage = data?.productSearch?.paginationInfo?.page;

  const [init, setInit] = useState(true);

  useEffect(() => {
    setInit(false);
  }, []);

  const retingValues = rating
    ? { ratingFrom: rating, ratingTo: RATING_TO }
    : {};

  const queries = ({ max, min }, offersQuery) => {
    isMobile && !shopChange && !offersQuery && getProducts({ max, min });
    isMobile && getOffersQuery({ max, min }, retingValues);
    !isMobile && getProducts({ max, min }, retingValues);
  };

  const [categoriesFilterQuery] = useFilterCategoryQuery({
    onCompleted: (response) => {
      const min = +response?.catalogFilter?.fields[0].intMin;
      const max = +response?.catalogFilter?.fields[0].intMax;

      dispatch(
        setPrice({
          priceValue: { max, min, inputMin: +min, inputMax: +max },
        }),
      );

      queries({ max, min });
    },
  });

  const getCateroriesFilter = useCallback(() => {
    categoriesFilterQuery({
      variables: {
        categoryId: +activeSubcategory?.id,
        shopId,
      },
    });
  }, [activeSubcategory?.id, categoriesFilterQuery, shopId]);

  const [isMobile, setIsMobile] = useState(null);

  useEffect(() => {
    setIsMobile(document.documentElement.clientWidth <= 768);
  }, []);

  const products = data && data?.productSearch?.items;
  const mobileTotalOffers =
    offersData?.productSearch?.paginationInfo?.totalItems;

  useEffect(() => {
    window.addEventListener('resize', onResize);
    onResize();
    return () => {
      window.removeEventListener('resize', onResize);
    };
  }, []);

  function onResize() {
    const customWidth = document.documentElement.clientWidth;

    setIsMobile(customWidth <= 768);
  }

  const getCategoryInfo = (arrayFilds) => {
    if (!arrayFilds) {
      return {};
    } else {
      const index = arrayFilds.findIndex(
        (item) => item.inputType === 'CATEGORY_BUTTONS',
      );
      return arrayFilds[index];
    }
  };

  const getSubcategoriesInfo = (subcategories) => {
    if (subcategories) {
      return [{ name: intl('app.all-products'), id }, ...subcategories];
    }
    return [];
  };

  const initialCategoryLoad = useRef(false);
  const initialShopLoad = useRef(false);

  const getProducts = (price, rating = retingValues) => {
    dispatch(setPage({ productPage: 1 }));
    query({
      variables: {
        filter: {
          q: null,
          bestPriceFrom: +price?.min || +priceValue.min,
          bestPriceTo: +price?.max || +priceValue.max,
          categoryId: activeSubcategory?.id,
          shopId,
          ...rating,
        },
        page: 1,
        sort: sort,
      },
    });
  };

  const getOffersQuery = (price, rating = retingValues) => {
    offersQuery({
      variables: {
        filter: {
          q: null,
          bestPriceFrom: +price?.min || +priceValue.min,
          bestPriceTo: +price?.max || +priceValue.max,
          categoryId: activeSubcategory?.id,
          shopId,
          ...rating,
        },
        page: 1,
        sort: sort,
      },
    });
  };

  const categoryInfo = getCategoryInfo(serverCategoryData?.fields);

  const subcategoriesInfo = getSubcategoriesInfo(categoryInfo?.items);
  //
  useEffect(() => {
    initialCategoryLoad.current && setActiveSubcategory({ id });
    initialCategoryLoad.current = true;
  }, [id]);

  useEffect(() => {
    if (subcategoryId && categoryInfo?.items?.length) {
      const subcategoryValue = categoryInfo?.items.find(
        (item) => +item.id === +subcategoryId,
      );
      setActiveSubcategory(subcategoryValue);
    }
  }, [categoryInfo, subcategoryId]);
  //

  useEffect(() => {
    initialQuery.current && getCateroriesFilter();
    initialQuery.current = true;
  }, [shopId, activeSubcategory?.id]);

  useEffect(() => {
    initialSortQuery.current && setShopChange(false);
    initialSortQuery.current &&
      queries({ max: priceValue.max, min: priceValue.min });
    initialSortQuery.current = true;
  }, [sort]);

  useEffect(() => {
    initialraitingQuery.current && isMobile && setShopChange(true);

    initialraitingQuery.current &&
      queries({ max: priceValue.max, min: priceValue.min }, true);

    initialraitingQuery.current = true;
  }, [rating]);

  useEffect(() => {
    isMobile && initialShopLoad.current && setShopChange(true);
    initialShopLoad.current = true;

  }, [shopId]);

  useEffect(() => {
    setShopChange(false);
  }, [activeSubcategory?.id]);

  useEffect(() => {
    if (fetching) {
      fetchMore({
        variables: {
          filter: {
            q: null,
            bestPriceFrom: +priceValue.min,
            bestPriceTo: +priceValue.max,
            categoryId: activeSubcategory?.id,
            shopId,
            ...retingValues,
          },
          page: productPage + 1,
          sort: sort,
        },
        updateQuery: (prev, { fetchMoreResult }) => {
          if (!fetchMoreResult) {
            return prev;
          }

          if (prev?.productSearch?.items) {
            return {
              productSearch: {
                paginationInfo: fetchMoreResult?.productSearch?.paginationInfo,
                items: [
                  ...prev?.productSearch?.items,
                  ...fetchMoreResult?.productSearch?.items,
                ],
              },
            };
          }
        },
      });
    }
  }, [fetching]);

  const scrollHandler = (e) => {
    if (
      e.target.documentElement.scrollHeight -
        (e.target.documentElement.scrollTop + window.innerHeight) <
      100
    ) {
      dispatch(setFetching({ fetching: true }));
    }
  };

  React.useEffect(() => {
    if (totalCount > products?.length) {
      document.addEventListener('scroll', scrollHandler);
    }
    return () => {
      document.removeEventListener('scroll', scrollHandler);
    };
  }, [totalCount, products]);

  const getVisibleProducts = () => {
    if (!products && !loading && init) {
      return serverProducts;
    } else {
      return products || [];
    }
  };

  const visibleProducts = getVisibleProducts();

  useEffect(() => {
    setCategoryNameContext(categoryName || categoryInfo?.label);
  }, [categoryName, categoryInfo?.label]);

  return (
    <MetaLayout title={categoryInfo?.label}>
      <NavigationMenu />
      <Header />
      <CategorySection>
        <CategoryItemsSection>
          <CategoryTitle>{categoryName || categoryInfo?.label}</CategoryTitle>
          <CategoryTagShopsWrapper>
            <CategoryTagShops>
              {categoryInfo &&
                subcategoriesInfo?.map((item, index) => (
                  <TagShop
                    key={index}
                    active={+activeSubcategory?.id === +item?.id}
                    onClick={() => {
                      setActiveCategoryContext({
                        ...activeCategoryContext,
                        subcategoryId: item?.id,
                      });
                      setActiveSubcategory(item);
                    }}
                  >
                    {item.name}
                  </TagShop>
                ))}
            </CategoryTagShops>
          </CategoryTagShopsWrapper>
          <SortFilter
            isMobile={isMobile}
            query={getProducts}
            offersQuery={getOffersQuery}
            setPrice={setPrice}
            setSort={setSort}
            priceValue={priceValue}
            sort={sort}
            totalCount={mobileTotalOffers}
            offersLoading={offersLoading}
            setShopId={setShopId}
            setRating={setRating}
            rating={rating}
            //
            searchShopQuery={searchShopQuery}
            searchShopLoading={searchShopLoading}
            searhShopData={searhShopData}
          />
            <CategoryItemList>
              {visibleProducts?.map((product, index) => {
                return (
                  <Product
                    product={product}
                    key={index}
                    categoryName={categoryName || categoryInfo?.label}
                    subcategoryName={
                      subcategoriesInfo.find(
                        (subCat) => +subCat?.id === +activeSubcategory?.id,
                      )?.name
                    }
                  />
                );
              })}
            </CategoryItemList>
            {fetching || loading ? (
              <LoaderWrapper>
                <Loader />
              </LoaderWrapper>
            ) : null}
        </CategoryItemsSection>
      </CategorySection>
      <Footer />
      {offersLoading && !loading && <RequestLoader />}
    </MetaLayout>
  );
}

export default CategoryPage;

export const getServerSideProps = async ({ params, query }) => {
  try {
    const totalInfo = await client.query({
      query: GET_CATEGORY_PRODUCTS_QUERY,
      fetchPolicy: 'no-cache',
      variables: {
        filter: {
          q: null,
          bestPriceFrom: 0,
          categoryId: query?.subcategoryId || params?.id,
        },
        page: 1,
        sort: 'BEST_PRICE_ASC',
        shopId: null,
        categoryId: query?.subcategoryId || params?.id,
      },
    });

    const categoryData = await client.query({
      query: FILTER_CATEGORY_QUERY,
      fetchPolicy: 'no-cache',
      variables: {
        filter: {
          q: null,
          bestPriceFrom: 0,
          categoryId: params?.id,
        },
        page: 1,
        sort: 'BEST_PRICE_ASC',
        shopId: null,
        categoryId: params?.id,
      },
    });

    return {
      props: {
        products: totalInfo.data.productSearch.items,
        paginationInfo: totalInfo.data.productSearch.paginationInfo,
        categoriesFilterData: totalInfo.data.catalogFilter,
        searhShopData: totalInfo.data.shopSearch,
        categoryData: categoryData.data.catalogFilter,
      },
    };
  } catch {
    return {
      notFound: true,
    };
  }
};

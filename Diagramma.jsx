import { useQuery } from '@apollo/client';
import React, { useState, useEffect } from 'react';
import {
  VictoryArea,
  VictoryAxis,
  VictoryChart,
  VictoryLine,
  VictoryTheme,
  VictoryTooltip,
  VictoryVoronoiContainer,
} from 'victory';

import { PRODUCT_PRICE_HISTORY_FIND } from '../../graphql';
import LabelComponent from './LabelComponent';
import Loader from '../Loader/Loader';
import {
  OverlayForScrollBottom,
  OverlayForScrollLeft,
  OverlayForScrollRight,
  OverlayForScrollTop,
  WrapperDiagramma,
} from './styles';

const Diagramma = ({ productId, regionId, isMobile }) => {
  const clientWidth = document.documentElement.clientWidth;
  const [ isTouchCount, setIsTouchCount ] = useState(0);
  
  const { data, loading } = useQuery(PRODUCT_PRICE_HISTORY_FIND, {
    variables: {
      productId: +productId,
      regionId: +regionId,
    },
  });
  if (loading)
    return (
      <Loader />
    );
  if (data?.productPriceHistoryFind?.length < 2) return null;
  const searchMinMax = (ary) => {
    if (!ary.length) return [ 0, 1 ];
    let min = ary[0].minPrice;
    let max = ary[0].maxPrice;
    ary.forEach(({ minPrice, maxPrice }) => {
      if (minPrice < min) min = minPrice;
      if (maxPrice > max) max = maxPrice;
    });
    const headerNum = max + min;
    const footerNum = 0;
    return [ headerNum, footerNum ];
  };
  const [ headerNum, footerNum ] = searchMinMax(
    data?.productPriceHistoryFind.slice(
      isMobile ? -12 : clientWidth > 450 ? -8 : -6,
    ),
  );
  
  const reconstructionArray = (ary, rangePrice, lang) => {
    return ary.map(({ date, minPrice, avgPrice, maxPrice }) => {
      switch (rangePrice) {
        case 'maxPrice':
          return {
            x: new Date(date).toLocaleString(lang || 'ru', {
              month: 'numeric',
              day: 'numeric',
            }),
            y: maxPrice,
          };
        case 'avgPrice':
          return {
            x: new Date(date).toLocaleString(lang || 'ru', {
              month: 'numeric',
              day: 'numeric',
            }),
            y: avgPrice,
          };
        case 'minPrice':
          return {
            x: new Date(date).toLocaleString(lang || 'ru', {
              month: 'numeric',
              day: 'numeric',
            }),
            y: minPrice,
          };
        case 'area':
          return {
            x: new Date(date).toLocaleString(lang || 'ru', {
              month: 'numeric',
              day: 'numeric',
            }),
            y: maxPrice,
            y0: minPrice,
            mid: avgPrice,
            dateField: new Date(date).toLocaleString(lang || 'ru', {
              month: 'numeric',
              day: 'numeric',
              year: 'numeric',
            }),
          };
      }
    });
  };
  
  const reconstructionArrayMax = reconstructionArray(
    data.productPriceHistoryFind.slice(
      isMobile ? -12 : clientWidth > 450 ? -8 : -6,
    ),
    'maxPrice',
  );
  const reconstructionArrayMiddle = reconstructionArray(
    data.productPriceHistoryFind.slice(
      isMobile ? -12 : clientWidth > 450 ? -8 : -6,
    ),
    'avgPrice',
  );
  const reconstructionArrayMin = reconstructionArray(
    data.productPriceHistoryFind.slice(
      isMobile ? -12 : clientWidth > 450 ? -8 : -6,
    ),
    'minPrice',
  );
  
  const createArea = reconstructionArray(
    data.productPriceHistoryFind.slice(
      isMobile ? -12 : clientWidth > 450 ? -8 : -6,
    ),
    'area',
  );
  
  const victoryChartHeight = !isMobile ? { height: 500 } : {};
  
  const fontSizeLabelValue = isMobile ? { fontSize: '15px' } : {};
  
  return (
    <WrapperDiagramma
      onTouchEnd={ () => {
        setIsTouchCount((prev) => prev + 1);
      } }
      onClick={ () => setIsTouchCount((prev) => prev + 1) }
    >
      <OverlayForScrollTop />
      <OverlayForScrollBottom />
      <OverlayForScrollRight />
      <OverlayForScrollLeft />
      
      <VictoryChart
        key={ isTouchCount }
        width={ isMobile ? 680 : clientWidth - 50 }
        theme={ VictoryTheme.material }
        scale={ { x: 'time' } }
        domain={ { y: [ footerNum, headerNum ] } }
        containerComponent={
          <VictoryVoronoiContainer
            voronoiDimension='x'
            labels={ () => ' ' }
            labelComponent={
              <VictoryTooltip
                flyoutComponent={
                  <LabelComponent
                    headerNum={ headerNum }
                    footerNum={ footerNum }
                    isMobile={ isMobile }
                  />
                }
              />
            }
          />
        }
      >
        <VictoryAxis
          style={ {
            tickLabels: {
              fill: '#B2BAD6',
              ...fontSizeLabelValue,
            },
          } }
        />
        <VictoryAxis
          style={ {
            tickLabels: {
              fill: '#B2BAD6',
              ...fontSizeLabelValue,
            },
          } }
          dependentAxis
        />
        <VictoryArea
          name={ 'areaField' }
          interpolation='natural'
          style={ {
            data: {
              fill: '#E6F3FD',
              stroke: '#E6F3FD',
              strokeWidth: 0,
            },
            labels: {
              fontSize: '14px',
            },
          } }
          data={ createArea }
        />
        <VictoryLine
          name={ 'Макс.' }
          interpolation='natural'
          data={ reconstructionArrayMax }
          style={ {
            data: {
              stroke: '#F47560',
              strokeWidth: ({ active }) => (active ? 2 : 1),
            },
          } }
        />
        
        <VictoryLine
          name={ 'Средняя' }
          interpolation='natural'
          data={ reconstructionArrayMiddle }
          style={ {
            data: {
              stroke: '#609DD5',
              strokeWidth: ({ active }) => (active ? 2 : 1),
            },
          } }
        />
        <VictoryLine
          name={ 'Мин.' }
          interpolation='natural'
          data={ reconstructionArrayMin }
          style={ {
            data: {
              stroke: '#FFD84E',
              strokeWidth: ({ active }) => (active ? 2 : 1),
            },
          } }
        />
      </VictoryChart>
    </WrapperDiagramma>
  );
};

export default Diagramma;

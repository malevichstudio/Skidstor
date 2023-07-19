import React, { memo } from 'react';
import { DateBlock, MainBlock, PriceBlock } from './styles';

const LabelComponent = (props) => {
  const { datum, x, y } = props;
  const axisX = (axis) => {
    if (x <= 140) {
      return;
    } else if (x >= 550) {
      return axis - 146;
    }
    return axis - 100;
  };
  const resX = axisX(x);

  const axisY = (axis) => {
    if (axis <= 120) return;
    return axis - 120;
  };
  const resY = axisY(y);

  return (
    <foreignObject width='100%' height='100%'>
      <MainBlock top={resY} left={resX} isMobile={!props.isMobile}>
        <DateBlock>{datum.dateField}</DateBlock>
        <PriceBlock color={'#F47560'}>
          <div>Макс.</div>
          <div>{datum.y}</div>
        </PriceBlock>

        <PriceBlock color={'#609DD5'}>
          <div>Средняя</div>
          <div>{datum.mid}</div>
        </PriceBlock>

        <PriceBlock color={'#FFD84E'}>
          <div>Мин.</div>
          <div>{datum.y0}</div>
        </PriceBlock>
      </MainBlock>
    </foreignObject>
  );
};

export default memo(LabelComponent);

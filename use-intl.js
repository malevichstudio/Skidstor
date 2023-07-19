import { useIntl as useReactIntl } from 'react-intl';

export const useIntl = () => {
  const intl = useReactIntl();

  return {
    intl: (id, values, options) => {
      return intl.formatMessage(
        {
          id,
        },
        { ...values },
        { ...options },
      );
    },
  };
};

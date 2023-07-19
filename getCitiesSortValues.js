export const getCitiesSortValues = (regions, searchValue) => {
  let indexValue = 0;
  const reg = new RegExp(searchValue, 'gi');

  const result = [];

  regions &&
    regions.length > 0 &&
    regions
      ?.filter((item) => {
        if (reg.test(item.name)) {
          return item;
        }
      })
      .forEach((region) => {
        if (result.length == 0) {
          result.push({
            label: region?.name[0].toUpperCase(),
            data: [],
          });
        }

        if (
          result
            ?.map((item) => item.label)
            .includes(region?.name[0].toUpperCase())
        ) {
          result[indexValue].data.push({
            name: region?.name,
            id: region?.id,
            lang: region?.language?.code,
          });
        } else {
          indexValue++;
          result.push({
            label: region?.name[0].toUpperCase(),
            data: [
              {
                name: region?.name,
                id: region?.id,
                lang: region?.language?.code,
              },
            ],
          });
        }
      });
  return result;
};

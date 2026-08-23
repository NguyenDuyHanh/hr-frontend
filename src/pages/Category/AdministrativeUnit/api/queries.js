import { useQuery } from '@tanstack/react-query';
import { pagingAdministrativeUnits, getAllProvinces } from '../../../../services/administrativeUnitService';

export const administrativeUnitKeys = {
  all: ['administrativeUnits'],
  list: (params) => [...administrativeUnitKeys.all, 'list', params],
  provinces: ['administrativeUnits', 'provinces'],
};

export const useAdministrativeUnits = (params) => {
  return useQuery({
    queryKey: administrativeUnitKeys.list(params),
    queryFn: async () => {
      const res = await pagingAdministrativeUnits(params);
      return res?.data || { content: [], totalElements: 0 };
    },
    placeholderData: (previousData) => previousData,
    staleTime: 1000 * 30,
  });
};

export const useProvinces = () => {
  return useQuery({
    queryKey: administrativeUnitKeys.provinces,
    queryFn: async () => {
      const res = await getAllProvinces();
      return res?.data || [];
    },
    staleTime: 1000 * 60 * 10,
  });
};

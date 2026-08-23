export const LEVEL_OPTIONS = [
  { value: 1, labelKey: 'administrativeUnit.level1', defaultLabel: 'Cấp 1 (Tỉnh/Thành phố)' },
  { value: 2, labelKey: 'administrativeUnit.level2', defaultLabel: 'Cấp 2 (Xã/Phường)' },
];

export const FILTER_LEVEL_OPTIONS = [
  { value: '', labelKey: 'administrativeUnit.all_levels', defaultLabel: 'Tất cả cấp độ' },
  ...LEVEL_OPTIONS,
];

export const PRODUCT_PLACEHOLDER = '/placeholder-product.jpg';
export const USER_PLACEHOLDER = '/placeholder-user.jpg';
export const FARM_PLACEHOLDER = '/placeholder-farm.jpg';

export const handleProductImageError = (e) => {
  e.currentTarget.onerror = null;
  e.currentTarget.src = PRODUCT_PLACEHOLDER;
};

export const handleUserImageError = (e) => {
  e.currentTarget.onerror = null;
  e.currentTarget.src = USER_PLACEHOLDER;
};

export const handleFarmImageError = (e) => {
  e.currentTarget.onerror = null;
  e.currentTarget.src = FARM_PLACEHOLDER;
};

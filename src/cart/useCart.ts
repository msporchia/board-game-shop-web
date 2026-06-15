import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { deleteCartItem, fetchCart, putCartItem } from '../api/cart.ts';
import type { Cart, CartItem } from '../contracts/cart.ts';
import { getCustomerId } from '../customer/customerId.ts';

/** Product fields needed to render an optimistic cart line before the server answers. */
export interface ProductRef {
  id: number;
  name: string;
  image: string | null;
  priceCents: number;
}

interface UseCartResult {
  cart: Cart | undefined;
  isPending: boolean;
  isError: boolean;
  /** Total quantity across lines; 0 while the cart loads. */
  itemCount: number;
  addItem: (product: ProductRef) => void;
  /** Sets a line's quantity; ≤ 0 removes the line. Clamped to MAX_QUANTITY. */
  setItemQuantity: (item: CartItem, quantity: number) => void;
  removeItem: (productId: number) => void;
}

export const MAX_QUANTITY = 99;

// Optimistic totals assume discounts don't change (linear pricing): exact in the
// common case, reconciled by the server on settle if a threshold flips. When the BFF
// emits discounts it MUST expose them as explicit lines (server is sole author of
// money) and the UI MUST render them, so displayed lines always sum to the shown
// total. Until then there are no non-product lines to render (see CLAUDE.md).
function withRecomputedTotals(cart: Cart, items: CartItem[]): Cart {
  return {
    ...cart,
    items,
    totalItems: items.reduce((sum, item) => sum + item.quantity, 0),
    totalCents: items.reduce((sum, item) => sum + item.lineTotalCents, 0),
  };
}

function upsertItem(cart: Cart, product: ProductRef, quantity: number): Cart {
  const exists = cart.items.some((item) => item.productId === product.id);
  const items = exists
    ? cart.items.map((item) =>
        item.productId === product.id
          ? { ...item, quantity, lineTotalCents: item.unitPriceCents * quantity }
          : item,
      )
    : [
        ...cart.items,
        {
          productId: product.id,
          name: product.name,
          image: product.image,
          unitPriceCents: product.priceCents,
          quantity,
          lineTotalCents: product.priceCents * quantity,
        },
      ];
  return withRecomputedTotals(cart, items);
}

function dropItem(cart: Cart, productId: number): Cart {
  return withRecomputedTotals(
    cart,
    cart.items.filter((item) => item.productId !== productId),
  );
}

export function useCart(): UseCartResult {
  const customerId = getCustomerId();
  const queryClient = useQueryClient();
  const queryKey = ['cart', customerId];

  const query = useQuery({
    queryKey,
    queryFn: ({ signal }) => fetchCart(customerId, signal),
  });

  const optimistically = async (rewrite: (cart: Cart) => Cart) => {
    await queryClient.cancelQueries({ queryKey });
    const previous = queryClient.getQueryData<Cart>(queryKey);
    if (previous) {
      queryClient.setQueryData(queryKey, rewrite(previous));
    }
    return { previous };
  };

  const rollback = (context: { previous: Cart | undefined } | undefined) => {
    if (context?.previous) {
      queryClient.setQueryData(queryKey, context.previous);
    }
  };

  const settle = () => queryClient.invalidateQueries({ queryKey });

  const setItemMutation = useMutation({
    mutationFn: ({ product, quantity }: { product: ProductRef; quantity: number }) =>
      putCartItem(customerId, product.id, quantity),
    onMutate: ({ product, quantity }) =>
      optimistically((cart) => upsertItem(cart, product, quantity)),
    onError: (_error, _variables, context) => rollback(context),
    onSettled: settle,
  });

  const removeItemMutation = useMutation({
    mutationFn: ({ productId }: { productId: number }) => deleteCartItem(customerId, productId),
    onMutate: ({ productId }) => optimistically((cart) => dropItem(cart, productId)),
    onError: (_error, _variables, context) => rollback(context),
    onSettled: settle,
  });

  const itemCount = query.data?.totalItems ?? 0;

  return {
    cart: query.data,
    isPending: query.isPending,
    isError: query.isError,
    itemCount,
    addItem: (product) => {
      const current = query.data?.items.find((item) => item.productId === product.id);
      const quantity = Math.min((current?.quantity ?? 0) + 1, MAX_QUANTITY);
      setItemMutation.mutate({ product, quantity });
    },
    setItemQuantity: (item, quantity) => {
      if (quantity < 1) {
        removeItemMutation.mutate({ productId: item.productId });
        return;
      }
      setItemMutation.mutate({
        product: {
          id: item.productId,
          name: item.name,
          image: item.image,
          priceCents: item.unitPriceCents,
        },
        quantity: Math.min(quantity, MAX_QUANTITY),
      });
    },
    removeItem: (productId) => removeItemMutation.mutate({ productId }),
  };
}

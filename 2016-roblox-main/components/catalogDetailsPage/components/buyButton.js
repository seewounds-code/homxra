import React, { useState } from "react";
import { createUseStyles } from "react-jss";
import AuthenticationStore from "../../../stores/authentication";
import ActionButton from "../../actionButton";
import Tickets from "../../tickets";
import CatalogDetailsPage from "../stores/catalogDetailsPage";
import CatalogDetailsPageModal from "../stores/catalogDetailsPageModal";
import BuyItemModal from "./buyItemModal";
import Robux from "./robux";
import OffsaleDeadline from "./offsaleDeadline";

const useBestPriceStyles = createUseStyles({
  wrapper: {
    background: '#fff',
    border: '1px solid #e5e5e5',
    borderRadius: '4px',
    padding: '14px 16px',
    marginBottom: '14px',
  },
  label: {
    color: '#757575',
    fontSize: '13px',
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    marginBottom: '4px',
  },
  price: {
    color: '#008000',
    fontWeight: 700,
    fontSize: '26px',
    lineHeight: '1.2',
    marginBottom: '2px',
  },
  robuxIcon: {
    display: 'inline-block',
    background: 'url("/img/img-robux.png")',
    backgroundSize: 'contain',
    width: '26px',
    height: '18px',
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'center',
    marginRight: '6px',
    verticalAlign: 'baseline',
  },
  priceValue: {
    fontSize: '32px',
  },
  seeMore: {
    color: '#7B1FA2',
    fontSize: '13px',
    cursor: 'pointer',
    '&:hover': {
      textDecoration: 'underline',
    },
  },
  noSellers: {
    color: '#757575',
    fontSize: '14px',
    marginTop: '6px',
  },
  purchaseButton: {
    width: '100%',
    marginTop: '12px',
  },
});

const BestPriceEntry = props => {
  const s = useBestPriceStyles();
  const store = CatalogDetailsPage.useContainer();
  const lowestSeller = store.getPurchaseDetails();
  if (!lowestSeller) {
    return <div className={s.wrapper}>
      <p className={s.label}>Best Price</p>
      <p className={s.noSellers}>No one is currently selling this item.</p>
    </div>
  }
  const lowestPrice = lowestSeller.price;
  return <div className={s.wrapper}>
    <p className={s.label}>Best Price</p>
    <p className={s.price}>
      <span className={s.robuxIcon}></span>
      <span className={s.priceValue}>{lowestPrice.toLocaleString()}</span>
    </p>
  </div>
}

const useBuyButtonStyles = createUseStyles({
  wrapper: {
    width: '100%',
    border: '1px solid #e5e5e5',
    background: '#fafafa',
    borderRadius: '4px',
    padding: '10px 14px',
    marginBottom: '14px',
  }
});

const PrivateSellersCount = props => {
  const store = CatalogDetailsPage.useContainer();
  return <p className='mt-2 mb-1 text-center'>
    <a className={props.className}>See more Resellers ({store.resellersCount || 0})</a>
  </p>
}

const useSaleCountStyles = createUseStyles({
  text: {
    color: '#757575',
    fontSize: '12px',
  }
})

const SaleCount = props => {
  const store = CatalogDetailsPage.useContainer();
  const s = useSaleCountStyles();
  const statusText = store.details?.assetType === 21 ? 'Awarded' : 'Sold';
  
  return (
    <p className={'mt-2 mb-0 text-center ' + s.text}>
      <span className='text-black'>{store.saleCount}</span> {statusText}
    </p>
  );
}

const OwnedCount = props => {
  const store = CatalogDetailsPage.useContainer();
  const s = useSaleCountStyles();
  if (!store.ownedCopies || store.ownedCopies.length === 0) return null;
  return <p className={'mt-2 mb-0 text-center ' + s.text}>
    <span className='text-black'>{store.ownedCopies.length}</span> Owned
  </p>
}

const useTicketPriceStyles = createUseStyles({
  ticketPrice: {
    width: '100%',
    height: '23px',
  },
});

const PriceTickets = props => {
  const s = useTicketPriceStyles();
  const store = CatalogDetailsPage.useContainer();

  return <div className={s.ticketPrice}>
    <span>Price: </span><Tickets>{store.details.priceTickets}</Tickets>
  </div>
}

const BuyAction = props => {
  const currency = props.currency; // 1 = Robux, 2 = Tickets
  const store = CatalogDetailsPage.useContainer();
  const authenticationStore = AuthenticationStore.useContainer();
  const modalStore = CatalogDetailsPageModal.useContainer();
  const productInfo = store.getPurchaseDetails();
  const auth = AuthenticationStore.useContainer();

  if (store.ownedCopies === null) return null;
  const isOwned = store.ownedCopies.length !== 0;
  const showPriceText = store.details.isForSale;
  const isResaleItem = store.isResellable;
  const isDisabled = !store.isResellable && !store.details.isForSale ||
    (isOwned && !store.isResellable) ||
    (store.isResellable && !productInfo ||
      store.isResellable && productInfo.sellerId === authenticationStore.userId
    );
  const isFree = !isDisabled && store.details.price === 0;

  const tooltipTitle = isOwned ? 'You already own this item.' : 'This item is not for sale';
  const actionBuyText = (() => {
      if (isFree && !isResaleItem)
        return 'Take One';

      if (currency === 2) {
        return 'Buy with Tx';
      }
      return 'Buy Now';
  })();

  if (store.isResellable) {
    if (!store.allResellers || store.allResellers.length === 0) {
      return null;
    }
  }

  return <div>
    {showPriceText &&
      <p className='mb-1 text-center'>
        {
          currency === 1 ? <Robux prefix="Price: ">{isFree ? 'FREE' : store.details.price}</Robux> :
          <PriceTickets />
        }
      </p>
    }
    <ActionButton onClick={(e) => {
      modalStore.openPurchaseModal(store.getPurchaseDetails(), auth.robux, auth.tix, currency);
    }} label={actionBuyText} disabled={isDisabled} tooltipText={tooltipTitle}/>
  </div>
}

const useOrTabStyles = createUseStyles({
  wrapper: {
    borderBottom: '1px solid #e5e5e5',
    marginBottom: '10px',
  },
  label: {
    padding: '0 10px',
    marginBottom: 0,
    width: 'width',
    textAlign: 'center',
  },
  labelBg: {
    background: '#fafafa',
    position: 'relative',
    bottom: '-10px',
  },
});

const PurchaseWithRobuxOrTicketsLabel = props => {
  const s = useOrTabStyles();
  return <div className={s.wrapper}>
    <p className={s.label}>
      <span className={s.labelBg}>OR</span>
    </p>
  </div>
}

/**
 * The purchase button
 * @param {*} props 
 */
const BuyButton = props => {
  const s = useBuyButtonStyles();
  const store = CatalogDetailsPage.useContainer();
  const isResellAsset = store.isResellable;
  // Show buy button if item has ticket price and no sale price, or if item has sale price
  const showBuyButton = (() => {
    if (isResellAsset) return true;

    if (store.details.priceTickets) {
      if (store.details.price === null) {
        return false;
      }
    }
    return true;
  })();
  const showBuyTicketsButton = store.details.priceTickets !== null && !isResellAsset;
  const showOrTab = !isResellAsset && showBuyButton && showBuyTicketsButton;
  const hasOffsaleLabel = store.offsaleDeadline !== null && !isResellAsset && (showBuyButton || showBuyTicketsButton);

  return <div>
    {isResellAsset ? <BestPriceEntry details={store.details}/> : null}
    <div className={s.wrapper}>
      <div>
        {hasOffsaleLabel ? <OffsaleDeadline offsaleDeadline={store.offsaleDeadline} /> : null}
      </div>
      <div>
        {!isResellAsset  ? <div className='mt-2'/> : null}
        {showBuyButton ? <BuyAction currency={1} /> : null}
      </div>
      <div>
        {showOrTab ? <PurchaseWithRobuxOrTicketsLabel /> : null}
        {showBuyTicketsButton ? <BuyAction currency={2} /> : null}
      </div>
      <div>
        {isResellAsset ? <PrivateSellersCount className='text-center'/> : null}
      </div>
      <div>
        {isResellAsset ? <OwnedCount/> : null}
      </div>
    </div>
    <div>
      {isResellAsset ? <SaleCount/> : null}
    </div>
  </div>
}

export default BuyButton;
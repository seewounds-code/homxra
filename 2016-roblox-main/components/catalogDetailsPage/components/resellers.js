import React, { useEffect, useState } from "react";
import { createUseStyles } from "react-jss";
import { setResellableAssetPrice, takeResellableAssetOffSale } from "../../../services/economy";
import AuthenticationStore from "../../../stores/authentication";
import ActionButton from "../../actionButton";
import CreatorLink from "../../creatorLink";
import CatalogDetailsPage from "../stores/catalogDetailsPage";
import CatalogDetailsPageModal from "../stores/catalogDetailsPageModal";
import ThumbnailStore from "../../../stores/thumbnailStore";
import Robux from "./robux";
import useButtonStyles from "../../../styles/buttonStyles";

const useSellerEntryStyles = createUseStyles({
  entry: {
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '14px',
    padding: '12px 0',
    borderBottom: '1px solid #f2f2f2',
    '&:last-of-type': {
      borderBottom: 'none',
    },
  },
  avatarWrapper: {
    width: '48px',
    height: '48px',
    borderRadius: '50%',
    overflow: 'hidden',
    flexShrink: '0',
    background: '#eee',
    border: '1px solid #ddd',
  },
  avatar: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    display: 'block',
  },
  sellerInfo: {
    flex: '1',
    minWidth: '0',
  },
  sellerName: {
    fontSize: '15px',
    fontWeight: 600,
    marginBottom: '2px',
    color: '#191919',
  },
  sellerMeta: {
    color: '#757575',
    fontSize: '13px',
  },
  serial: {
    color: '#191919',
    fontWeight: 600,
  },
  price: {
    color: '#008000',
    fontSize: '16px',
    fontWeight: 600,
    minWidth: '90px',
    textAlign: 'right',
  },
  button: {
    fontSize: '14px',
    marginTop: '0',
    paddingLeft: '16px',
    paddingRight: '16px',
    minWidth: '110px',
  },
  takeOffSale: {
    background: 'grey',
    '&:hover': {
      background: 'darkgrey',
    },
  },
});

const SellerEntry = props => {
  const s = useSellerEntryStyles();
  const authStore = AuthenticationStore.useContainer();
  const isOwnItem = authStore.userId === props.seller.id;
  const store = CatalogDetailsPage.useContainer();
  const modalStore = CatalogDetailsPageModal.useContainer();
  const [locked, setLocked] = useState(false);
  const thumbs = ThumbnailStore.useContainer();

  const buttonStyles = useButtonStyles();
  const avatarUrl = thumbs.getUserHeadshot(props.seller.id) || '/img/placeholder.png';
  return <div className={s.entry}>
    <div className={s.avatarWrapper}>
      <img className={s.avatar} src={avatarUrl} alt={props.seller.name} onError={e => { e.target.src = '/img/placeholder.png' }} />
    </div>
    <div className={s.sellerInfo}>
      <p className={s.sellerName}>
        <CreatorLink id={props.seller.id} type='User' name={props.seller.name}></CreatorLink>
      </p>
      <p className={s.sellerMeta}>
        Serial <span className={s.serial}>{props.serialNumber || 'N/A'}</span>
      </p>
    </div>
    <div className={s.price}>
      <Robux>{props.price.toLocaleString()}</Robux>
    </div>
    <div>
      {
        isOwnItem ? <ActionButton disabled={locked} label='Take Off Sale' className={s.button + ' ' + s.takeOffSale} onClick={(e) => {
          e.preventDefault();
          setLocked(true);
          takeResellableAssetOffSale({
            assetId: store.details.id,
            userAssetId: props.userAssetId,
          }).then(() => {
            store.setAllResellers(store.allResellers.filter(c => {
              return c.userAssetId !== props.userAssetId;
            }))
          })
        }}></ActionButton> : <ActionButton label='Buy' className={s.button + ' ' + buttonStyles.buyButton} onClick={(e) => {
          e.preventDefault();
          modalStore.openPurchaseModal(store.getPurchaseDetails(props.userAssetId), authStore.robux, authStore.tix, 1);
        }}></ActionButton>
      }
    </div>
  </div>;
}

const usePaginationStyles = createUseStyles({
  text: {
    display: 'inline',
    marginBottom: 0,
    userSelect: 'none',
  },
  link: {
    paddingRight: '5px',
  },
  linkClickable: {
    color: '#7B1FA2',
    cursor: 'pointer',
  },
});

const ResellersPagination = props => {
  const s = usePaginationStyles();
  const store = CatalogDetailsPage.useContainer();
  if (!store.resellers) return null;
  const pages = Math.ceil(store.resellersCount / 6);
  const [pagesBack, setPagesBack] = useState([]); // Array of pages to appear on left side
  const [pagesForward, setPagesForward] = useState([]); // Array of pages to appear on right side
  const [showDots, setShowDots] = useState(false);

  useEffect(() => {
    let pagesAhead = [];
    let pagesBehind = [];
    for (let i = 1; i <= pages; i++) {
      if (i === store.resellersPage) continue;
      if (i > store.resellersPage) {
        pagesAhead.push(i);
      } else {
        pagesBehind.unshift(i);
      }
    }
    setPagesBack(pagesBehind.slice(0, 4));
    setPagesForward(pagesAhead.slice(0, 4));
    setShowDots(pagesAhead.length > 4);
  }, [store.resellersPage]);


  const onClick = v => {
    return (e) => {
      e.preventDefault();
      store.setResellersPage(v);
    }
  }

  const firstAvailable = store.resellersPage !== 1;
  const previousAvailable = firstAvailable;
  const lastAvailable = store.resellersPage !== pages;
  const nextAvailable = lastAvailable;

  /**
   * Condition link
   * @param {{page: number; condition: boolean; children: JSX.Element | string}} props 
   * @returns 
   */
  const LinkOnCondition = (props) => {
    if (props.condition) {
      return <span className={s.link + ' ' + s.linkClickable} onClick={(v) => {
        store.setResellersPage(props.page);
      }}>{props.children}</span>
    }
    return <span className={s.link}>{props.children}</span>
  }

  return <div>
    <p className={s.text}>
      <LinkOnCondition condition={firstAvailable} page={1}>First</LinkOnCondition>
      <LinkOnCondition condition={previousAvailable} page={store.resellersPage - 1}>Previous</LinkOnCondition>
      {
        pagesBack.map(v => {
          return <LinkOnCondition key={v} condition={true} page={v}>{v}</LinkOnCondition>
        })
      }
      <span className={s.link}>{store.resellersPage}</span>
      {
        pagesForward.map(v => {
          return <LinkOnCondition key={v} condition={true} page={v}>{v}</LinkOnCondition>
        })
      }
      {showDots && <span className={s.link}>...</span>}
      <LinkOnCondition condition={nextAvailable} page={store.resellersPage + 1}>Next</LinkOnCondition>
      <LinkOnCondition condition={lastAvailable} page={pages}>Last</LinkOnCondition>
    </p>
  </div>
}

const useMainStyles = createUseStyles({
  empty: {
    color: '#757575',
    fontSize: '15px',
    padding: '16px 0',
    textAlign: 'center',
    marginBottom: 0,
  },
  pagination: {
    marginTop: '10px',
    marginBottom: 0,
  },
});

const Resellers = props => {
  const s = useMainStyles();
  const store = CatalogDetailsPage.useContainer();
  if (!store.resellers) return null;

  return <div>
    {store.allResellers && store.allResellers.length === 0 ? <p className={s.empty}>No one is privately selling this item at the moment.</p> : store.resellers.map(v => {
      return <SellerEntry key={v.userAssetId} {...v}></SellerEntry>
    })}
    {store.allResellers && store.allResellers.length > 0 ? <div className={s.pagination}>
      <ResellersPagination></ResellersPagination>
    </div> : null}
  </div>
}

export default Resellers;
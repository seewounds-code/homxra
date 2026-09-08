import { useRouter } from "next/dist/client/router";
import React, { useEffect, useState } from "react";
import { createUseStyles } from "react-jss";
import { counterTrade, createTrade, getTradeDetails } from "../../services/trades";
import { getUserInfo } from "../../services/users";
import AuthenticationStore from "../../stores/authentication";
import InventorySection from "./components/inventorySection";
import OfferPanel from "./components/offerPanel";
import TradeWindowStore from "./stores/tradeWindowStore";

const usePageStyles = createUseStyles({
  page: {
    padding: '24px 24px 68px',
    minHeight: 'calc(100vh - 88px)',
  },
  shell: {
    maxWidth: '1210px',
    margin: '0 auto',
  },
  backLink: {
    fontSize: '15px',
    color: '#191919',
    textDecoration: 'none',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    marginBottom: '14px',
    '&:hover': {
      color: '#000',
      textDecoration: 'underline',
    },
  },
  backLinkArrow: {
    fontSize: '18px',
    lineHeight: '1',
  },
  title: {
    fontSize: '26px',
    fontWeight: 600,
    color: '#191919',
    margin: '0 0 24px',
  },
  content: {
    display: 'grid',
    gridTemplateColumns: 'minmax(0,704px) minmax(340px,390px)',
    gap: '28px',
    alignItems: 'start',
  },
  inventoryColumn: {
    minWidth: 0,
  },
  builderColumn: {
    minWidth: 0,
  },
  divider: {
    height: '1px',
    background: '#e5e5e5',
    margin: '28px 0',
  },
  makeOfferWrapper: {
    marginTop: '20px',
  },
  makeOfferButton: {
    width: '100%',
    display: 'block',
    padding: '12px 16px',
    fontSize: '17px',
    fontWeight: 600,
    color: '#fff',
    borderRadius: '3px',
    border: 'none',
    cursor: 'pointer',
    background: '#00a000',
    transition: 'background 0.15s',
    '&:hover': {
      background: '#008a00',
    },
  },
  makeOfferDisabled: {
    background: '#bfbfbf',
    cursor: 'not-allowed',
    '&:hover': {
      background: '#bfbfbf',
    },
  },
  feedbackBox: {
    padding: '10px 14px',
    borderRadius: '3px',
    marginTop: '12px',
    fontSize: '14px',
  },
  feedbackError: {
    background: '#fde8e8',
    color: '#c0392b',
    border: '1px solid #f1a9a0',
  },
  feedbackSuccess: {
    background: '#e6f4ea',
    color: '#1e7e34',
    border: '1px solid #a3d9b1',
  },
  feeNote: {
    fontSize: '12px',
    color: '#999',
    margin: '8px 0 0',
    textAlign: 'center',
  },
});

const TradeWindow = props => {
  const store = TradeWindowStore.useContainer();
  const auth = AuthenticationStore.useContainer();

  const router = useRouter();
  const userId = router.query['TradePartnerID'];
  const sessionId = router.query['TradeSessionId'];

  const [name, setName] = useState(null);
  const [locked, setLocked] = useState(false);
  const [localFeedback, setLocalFeedback] = useState(null);

  useEffect(() => {
    if (!userId) return
    getUserInfo({ userId }).then(info => {
      setName(info.name);
      store.setPartnerUserId(info.id);
    })
  }, [userId]);

  useEffect(() => {
    if (!sessionId || !auth.userId) return;
    getTradeDetails({
      tradeId: sessionId,
    }).then((d) => {
      store.setCounterId(d.id);
      for (const item of d.offers) {
        let isMine = item.user.id === auth.userId;
        if (isMine) {
          store.setOfferItems(item.userAssets.map(v => {
            v.userAssetId = v.id;
            return v;
          }));
          store.setOfferRobux(item.robux);
        } else {
          store.setRequestItems(item.userAssets.map(v => {
            v.userAssetId = v.id;
            return v;
          }));
          store.setRequestRobux(item.robux)
        }
      }
    }).catch(e => {
      store.setFeedback(`This trade session is invalid or you are not authorized to view it.`);
    })
  }, [sessionId, auth.userId]);

  const s = usePageStyles();

  if (!userId || !name || !store.partnerUserId) return null;

  const isLoggedIn = auth.userId !== null;

  const handleSendRequest = () => {
    if (locked) return;
    store.setFeedback(null);
    setLocalFeedback(null);
    if (store.requestItems.length === 0 || store.offerItems.length === 0) {
      store.setFeedback(`Your must request and offer must both contain at least one item.`)
      return;
    }
    setLocked(true);
    let promise = null;
    let request = {
      offerUserId: auth.userId,
      offerUserAssets: store.offerItems.map(v => v.userAssetId),
      offerRobux: store.offerRobux,
      requestUserId: userId,
      requestUserAssets: store.requestItems.map(v => v.userAssetId),
      requestRobux: store.requestRobux,
    }
    if (store.counterId) {
      request.tradeId = store.counterId;
      promise = counterTrade(request);
    } else {
      promise = createTrade(request)
    }
    promise.then(result => {
      setLocalFeedback({ type: 'success', text: 'Your trade request has been sent.' });
    }).catch(e => {
      let msg = e.response?.data?.errors[0]?.message;
      store.setFeedback(msg || e.message);
    }).finally(() => {
      setLocked(false);
    })
  };

  return <div className={s.page}>
    <div className={s.shell}>
      <a className={s.backLink} href='/My/Trades.aspx'>
        <span className={s.backLinkArrow}>‹</span>
        <span>Back to Trades List</span>
      </a>
      <h1 className={s.title}>Trade with {name}</h1>

      <div className={s.content}>
        <div className={s.inventoryColumn}>
          <InventorySection mode='Offer' />
          <div className={s.divider}></div>
          <InventorySection mode='Request' />
        </div>

        <div className={s.builderColumn}>
          <OfferPanel mode='Offer' />
          <div className={s.divider}></div>
          <OfferPanel mode='Request' />

          <div className={s.makeOfferWrapper}>
            <button
              className={s.makeOfferButton + (isLoggedIn ? '' : ' ' + s.makeOfferDisabled)}
              disabled={!isLoggedIn || locked}
              title={isLoggedIn ? '' : 'You need to be logged in to trade.'}
              onClick={handleSendRequest}
            >
              Make Offer
            </button>
          </div>

          {store.feedback && <div className={s.feedbackBox + ' ' + s.feedbackError}>
            <p style={{ margin: 0 }}>{store.feedback}</p>
          </div>}
          {localFeedback && <div className={s.feedbackBox + ' ' + (localFeedback.type === 'error' ? s.feedbackError : s.feedbackSuccess)}>
            <p style={{ margin: 0 }}>{localFeedback.text}</p>
          </div>}

          <p className={s.feeNote}>* A 30% fee will be taken from the offer amount.</p>
        </div>
      </div>
    </div>
  </div>
}

export default TradeWindow;
import React, { useEffect } from "react";
import { createUseStyles } from "react-jss";
import AuthenticationStore from "../../stores/authentication";
import GearDropdown from "../gearDropdown";
import ReportAbuse from "../reportAbuse";
import BuyButton from "./components/buyButton";
import BuyItemModal from "./components/buyItemModal";
import Comments from "./components/comments";
import CreatorLink from "../creatorLink";
import DelistItemModal from "./components/delistItemModal";
import ItemImage from "../itemImage";
import Recommendations from "./components/recommendations";
import Resellers from "./components/resellers";
import SaleHistory from "./components/saleHistory";
import SellItemModal from "./components/sellItemModal";
import CatalogDetailsPage from "./stores/catalogDetailsPage";
import AdBanner from "../ad/adBanner";
import { addOrRemoveFromCollections } from "../../services/catalog";
import { getCollections } from "../../services/inventory";
import getFlag from "../../lib/getFlag";
import Owners from "./components/owners";
import Favorite from "./components/favorite";
import dayjs from "../../lib/dayjs";

const emptyDescriptionMessage = 'No description available.';
const filterTextForEmpty = str => {
  if (!str) return emptyDescriptionMessage;
  if (str.trim().length === 0) {
    return emptyDescriptionMessage;
  }
  if (!str.match(/[a-z0-9A-Z]+/g)) {
    return emptyDescriptionMessage;
  }
  return str;
}

const genreToHuman = str => {
  switch (str) {
    case 'TownAndCity':
      return 'Town and City';
    default:
      return str;
  }
}

const useStyles = createUseStyles({
  pageWrapper: {
    padding: '12px 0 40px',
    minHeight: '70vh',
  },
  itemContainer: {
    background: '#fff',
    borderRadius: '4px',
    boxShadow: '0 1px 4px 0 rgba(25,25,25,0.2)',
    padding: '20px',
    marginBottom: '24px',
  },
  itemInner: {
    display: 'flex',
    flexWrap: 'wrap',
    '@media (min-width: 750px)': {
      flexWrap: 'nowrap',
    },
  },
  itemThumbContainer: {
    position: 'relative',
    width: '100%',
    alignSelf: 'flex-start',
    '@media (min-width: 750px)': {
      width: '300px',
      flexShrink: '0',
      marginRight: '28px',
    },
  },
  itemImageBox: {
    position: 'relative',
  },
  itemStatusContainer: {
    position: 'absolute',
    top: '10px',
    left: '10px',
    background: 'rgba(0,0,0,0.6)',
    color: '#fff',
    fontSize: '12px',
    borderRadius: '3px',
    padding: '3px 8px',
    zIndex: '2',
  },
  itemInteractionContainer: {
    position: 'absolute',
    top: '10px',
    right: '10px',
    zIndex: '2',
  },
  restrictionsContainer: {
    position: 'absolute',
    bottom: '12px',
    left: '0',
    right: '0',
    display: 'flex',
    justifyContent: 'center',
    zIndex: '2',
    pointerEvents: 'none',
  },
  limitedBadge: {
    color: '#fff',
    fontSize: '11px',
    fontWeight: '700',
    letterSpacing: '1px',
    textTransform: 'uppercase',
    padding: '4px 12px',
    borderRadius: '3px',
    background: 'linear-gradient(0deg, #b8860b 0%, #f0d060 100%)',
    boxShadow: '0 1px 3px rgba(0,0,0,0.4)',
    textShadow: '0 1px 1px rgba(0,0,0,0.35)',
  },
  limitedUniqueBadge: {
    background: 'linear-gradient(0deg, #6b4f22 0%, #c8a24c 100%)',
  },
  itemDetailsContainer: {
    flex: '1',
    minWidth: '0',
  },
  itemHeaderContainer: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: '14px',
  },
  title: {
    fontWeight: 700,
    fontSize: '28px',
    color: '#191919',
    marginBottom: '2px',
    wordBreak: 'break-word',
  },
  subtitle: {
    fontWeight: 400,
    fontSize: '14px',
    color: '#757575',
    marginBottom: 0,
  },
  creatorRow: {
    display: 'flex',
    alignItems: 'center',
    marginTop: '6px',
  },
  creatorLabel: {
    color: '#757575',
    fontSize: '14px',
    marginRight: '4px',
  },
  itemDetails: {
    marginTop: '18px',
  },
  attrRow: {
    display: 'flex',
    alignItems: 'flex-start',
    padding: '6px 0',
    borderBottom: '1px solid #f2f2f2',
  },
  attrLabel: {
    width: '130px',
    color: '#757575',
    fontSize: '14px',
    flexShrink: '0',
  },
  attrValue: {
    color: '#191919',
    fontSize: '14px',
    fontWeight: 600,
    flex: '1',
  },
  attrLink: {
    color: '#7B1FA2',
    fontWeight: 600,
  },
  genres: {
    display: 'flex',
    flexDirection: 'column',
  },
  descriptionTitle: {
    marginTop: '14px',
    color: '#757575',
    fontSize: '14px',
    fontWeight: 600,
    marginBottom: '4px',
  },
  description: {
    marginBottom: '4px',
    fontSize: '14px',
    color: '#191919',
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
  },
  sectionHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    margin: '28px 0 12px',
    '& h3': {
      margin: 0,
      color: '#191919',
      fontWeight: 700,
      fontSize: '22px',
    },
  },
  sectionBody: {
    background: '#fff',
    borderRadius: '4px',
    boxShadow: '0 1px 4px 0 rgba(25,25,25,0.2)',
    padding: '18px 20px',
  },
  commentsSection: {
    marginTop: '24px',
    paddingTop: '18px',
    borderTop: '1px solid #e5e5e5',
  },
  commentTitle: {
    color: '#191919',
    fontWeight: 700,
    fontSize: '22px',
    marginBottom: '12px',
  },
})

/**
 * CatalogDetails page
 * @param {{details: AssetDetailsEntry}} props
 * @returns 
 */
const CatalogDetails = props => {
  const { details } = props;
  const authStore = AuthenticationStore.useContainer();
  const s = useStyles();
  const isLimited = details.itemRestrictions.includes('Limited');
  const isLimitedUnique = details.itemRestrictions.includes('LimitedUnique');
  const store = CatalogDetailsPage.useContainer();

  useEffect(() => {
    store.setDetails(props.details);
    if (props.details.saleCount) {
      store.setSaleCount(props.details.saleCount);
    }else{
      store.setSaleCount(0);
    }
    if (props.details.offsaleDeadline) {
      store.setOffsaleDeadline(props.details.offsaleDeadline);
    }else{
      store.setOffsaleDeadline(null);
    }
  }, [props]);

  useEffect(() => {
    if (!authStore.userId || !store.details) {
      return;
    }
    store.loadOwnedCopies(authStore.userId);
    if (store.isResellable) {
      store.loadResellers();
    }
    getCollections({
      userId: authStore.userId,
    }).then(col => {
      let inCollection = col.find(v => {
        return v.Id === store.details.id;
      });
      store.setInCollection(inCollection !== undefined);
    })
  }, [store.details, authStore.userId]);

  const hasItemToDeList = store.isResellable && store.allResellers && store.allResellers.find(v => v.seller.id === authStore.userId) !== undefined;
  const hasItemToSell = store.isResellable && store.ownedCopies && store.ownedCopies.filter(v => v.price === null || v.price === 0).length > 0;
  const isCreator = store.details && store.details.creatorType === 'User' && store.details.creatorTargetId == authStore.userId; // todo: group support
  const showGear = hasItemToDeList ||
    hasItemToSell ||
    isCreator ||
    (store.ownedCopies && store.ownedCopies.length > 0) // Collection stuff

  if (!store.details) return null;

  const typeName = store.subCategoryDisplayName || 'Item';
  const genres = (details.genres || []).map(genreToHuman);
  const createdDate = dayjs(details.createdAt).isValid() ? dayjs(details.createdAt).format('MMMM D, YYYY') : null;

  return <div className={s.pageWrapper}>
    <div className='container'>
      <AdBanner />
      <div className={s.itemContainer}>
        <BuyItemModal/>
        <SellItemModal/>
        <DelistItemModal/>
        <div className={s.itemInner}>
          <div className={s.itemThumbContainer}>
            <div className={s.itemImageBox}>
              <ItemImage id={details.id} name={details.name}/>
              {store.isResellable ? <div className={s.itemStatusContainer}>{store.saleCount} {store.details?.assetType === 21 ? 'Awarded' : 'Sold'}</div> : null}
              <div className={s.restrictionsContainer}>
                {isLimitedUnique ? <span className={s.limitedBadge + ' ' + s.limitedUniqueBadge}>Limited Unique</span>
                  : isLimited ? <span className={s.limitedBadge}>Limited</span> : null}
              </div>
              <div className={s.itemInteractionContainer}>
                <Favorite assetId={details.id} favoriteCount={details.favoriteCount} />
              </div>
            </div>
          </div>
          <div className={s.itemDetailsContainer}>
            <div className={s.itemHeaderContainer}>
              <div>
                <h2 className={s.title}>{details.name}</h2>
                <p className={s.subtitle}>{store.subCategoryDisplayName}{isLimited ? ' | Collectible' : ''}{isLimitedUnique ? ' | Limited Edition' : ''}</p>
                <div className={s.creatorRow}>
                  <span className={s.creatorLabel}>By</span>
                  <CreatorLink id={details.creatorTargetId} name={details.creatorName} type={details.creatorType}/>
                </div>
              </div>
              <div>
                {
                  showGear && <GearDropdown options={[
                    hasItemToDeList && {
                      name: 'Take Off Sale',
                      onClick: (e) => {
                        e.preventDefault();
                        store.setUnlistModalOpen(true);
                      },
                    },
                    hasItemToSell && {
                      name: 'Sell Item',
                      onClick: (e) => {
                        e.preventDefault();
                        store.setResaleModalOpen(true);
                      },
                    },
                    isCreator && {
                      name: 'Configure',
                      url: '/My/Item.aspx?id=' + props.details.id,
                    },
                    isCreator && {
                      name: 'Advertise',
                      url: '/My/CreateUserAd.aspx?targetId=' + props.details.id + '&targetType=asset',
                    },
                    store.inCollection ? {
                      name: 'Remove From Collection',
                      onClick: e => {
                        e.preventDefault();
                        store.setInCollection(false);
                        addOrRemoveFromCollections({
                          assetId: store.details.id,
                          addToProfile: false,
                        });
                      },
                    } : store.ownedCopies && store.ownedCopies.length > 0 ? {
                      name: 'Add To Collection',
                      onClick: e => {
                        e.preventDefault();
                        store.setInCollection(true);
                        addOrRemoveFromCollections({
                          assetId: store.details.id,
                          addToProfile: true,
                        });
                      },
                    } : null,
                  ].filter(v => !!v)} />
                }
              </div>
            </div>
            <div className={s.itemDetails}>
              <BuyButton/>
              <div className={s.attrRow}>
                <span className={s.attrLabel}>Type</span>
                <span className={s.attrValue}>{typeName}</span>
              </div>
              {createdDate ? <div className={s.attrRow}>
                <span className={s.attrLabel}>Created</span>
                <span className={s.attrValue}>{createdDate}</span>
              </div> : null}
              {genres && genres.length > 0 ? <div className={s.attrRow}>
                <span className={s.attrLabel}>Genres</span>
                <span className={s.attrValue}>
                  <span className={s.genres}>
                    {genres.map(v => <span key={v}>{v}</span>)}
                  </span>
                </span>
              </div> : null}
              <p className={s.descriptionTitle}>Description</p>
              <p className={s.description}>{filterTextForEmpty(details.description)}</p>
              <ReportAbuse assetId={details.id}/>
            </div>
          </div>
        </div>
      </div>

      {store.isResellable ? <>
        <div className={s.sectionHeader}>
          <h3>Price Chart</h3>
        </div>
        <div className={s.sectionBody}>
          <SaleHistory/>
        </div>

        <div className={s.sectionHeader}>
          <h3>Resellers</h3>
        </div>
        <div className={s.sectionBody}>
          <Resellers/>
        </div>
      </> : null}

      {(isLimited || isLimitedUnique) && getFlag('catalogDetailsPageOwnersTabEnabled', false) ? <>
        <div className={s.sectionHeader}>
          <h3>Owners</h3>
        </div>
        <div className={s.sectionBody}>
          <Owners assetId={details.id}/>
        </div>
      </> : null}

      <div className={s.sectionHeader}>
        <h3>Recommended Items</h3>
      </div>
      <div className={s.sectionBody}>
        <Recommendations assetId={details.id} assetType={details.assetType}/>
      </div>

      <div className={s.commentsSection}>
        <p className={s.commentTitle}>Commentary</p>
        <Comments assetId={details.id}/>
      </div>
    </div>
  </div>
}

export default CatalogDetails;
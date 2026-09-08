import { createUseStyles } from "react-jss";
import { useEffect } from "react";
import ItemImage from "../itemImage";
import { getItemUrl } from "../../services/catalog";
import useCardStyles from "../userProfile/styles/card";
import PlayerHeadshot from "../playerHeadshot";
import Robux from "../robux";
import Link from "../link";
import CollectiblesPageStore from "./stores/collectiblesPageStore";
import Subtitle from "../userProfile/components/subtitle";
import AdBanner from "../ad/adBanner";
import GenericPagination from "../genericPagination";

const useStyles = createUseStyles({
  itemCard: {
    background: '#fff',
    padding: '4px',
    borderRadius: '4px',
    boxShadow: '0 1px 3px rgba(150,150,150,0.75)',
    marginBottom: '1rem',
    '&:hover': {
      boxShadow: '0 1px 6px 0 #757575',
    },
    cursor: 'pointer',
  },
  serial: {
    background: '#000',
    color: '#fff',
    padding: '4px 8px',
    borderRadius: '4px',
    display: 'inline-block',
    float: 'right',
    fontSize: '12px',
    marginTop: '10px',
    marginRight: '10px',
    marginBottom: '-34px',
    zIndex: '2',
    position: 'relative',
  },
  itemLabel: {
    fontWeight: '400',
    fontSize: '12px',
    color: 'rgb(25, 25, 25)',
    borderTop: '1px solid #f2f2f2',
    marginTop: '2px',
    marginBottom: '2px',
  },
  rapLabel: {
    fontWeight: '400',
    fontSize: '12px',
    color: '#757575',
    marginTop: '2px',
    marginBottom: '0',
  },
  avatarWrapper: {
    border: '1px solid #B8B8B8',
    maxWidth: '120px',
    borderRadius: '50%',
    overflow: 'hidden',
    width: '120px',
    height: '120px',
    margin: '0 auto',
  },
  totalRap: {
    fontWeight: 300,
    fontSize: '20px',
    marginTop: '10px',
  },
})

const CollectibleItem = props => {
  const s = useStyles();
  const {item} = props;

  return <div className='col-6 col-md-3 col-lg-2 ps-1 pe-1'>
    <Link href={getItemUrl({name: item.name, assetId: item.assetId})}>
      <a>
        <div className={s.itemCard}>
          {typeof item.serialNumber === 'number' ? <p className={s.serial}>#{item.serialNumber}</p> : null }
          <ItemImage id={item.assetId} name={item.name}/>
          <p className={s.itemLabel + ' text-truncate'}>{item.name}</p>
          <p className={s.rapLabel}><Robux>{item.recentAveragePrice.toLocaleString()}</Robux></p>
        </div>
      </a>
    </Link>
  </div>
}

const CollectiblesPage = props => {
  const s = useStyles();
  const cardStyles = useCardStyles();
  const store = CollectiblesPageStore.useContainer();
  const { userId } = props;

  useEffect(() => {
    store.setUserId(userId);
  }, [userId]);

  const isEmpty = store.items && store.items.length === 0;
  const showPaging = store.items && !isEmpty && !store.loading;

  return <div className='container'>
      <AdBanner/>
      <div className={`card ${cardStyles.card}`}>
        <div className='card-body'>
          <div className='row'>
            <div className='col-12 col-lg-2 pe-0'>
              <div className={s.avatarWrapper}>
                <PlayerHeadshot id={userId} name={store.userInfo?.name}/>
              </div>
            </div>
            <div className='col-12 col-lg-10 ps-0'>
              <h2 className='text-center'>{store.userInfo ? store.userInfo.name : '...'}</h2>
              <p className={s.totalRap + ' text-center'}>{store.totalRap !== null ? <>Total RAP: <Robux>{(store.totalRap || 0).toLocaleString()}</Robux></> : null}</p>
            </div>
          </div>
        </div>
      </div>
      <Subtitle>
        Collectibles of {store.userInfo ? store.userInfo.name : userId}
      </Subtitle>
      <div className='row'>
        {store.items ? store.items.map((item, i) => {
          return <CollectibleItem key={item.userAssetId + '-' + i} item={item}/>
        }) : null}
      </div>
      {isEmpty ? <p className='text-center mt-4'>This player does not own any collectibles.</p> : null}
      {store.error ? <p className='text-center mt-4'>An error occurred while loading this player's collectibles. Their inventory may be private.</p> : null}
      {showPaging ? <div className='row'>
        <div className='col-6 col-lg-3 mx-auto'>
          <GenericPagination
            page={store.previousPageCursor ? Math.floor(parseInt(store.previousPageCursor) / 50) + 1 : 1}
            pageCount={null}
            onClick={dir => {
              return (e) => {
                e.preventDefault();
                if (dir === 1) {
                  store.setPage(false, true);
                } else {
                  store.setPage(true, false);
                }
              }
            }}
          />
        </div>
      </div> : null}
    </div>
}

export default CollectiblesPage;
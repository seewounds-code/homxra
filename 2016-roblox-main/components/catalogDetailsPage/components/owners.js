import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { getCollectibleOwners } from "../../../services/inventory";
import ActionButton from "../../actionButton";
import CreatorLink from "../../creatorLink";
import GenericPagination from "../../genericPagination";
import ThumbnailStore from "../../../stores/thumbnailStore";
import { createUseStyles } from "react-jss";

const useStyles = createUseStyles({
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
  ownerInfo: {
    flex: '1',
    minWidth: '0',
  },
  ownerName: {
    fontSize: '15px',
    fontWeight: 600,
    marginBottom: '2px',
    color: '#191919',
  },
  ownerMeta: {
    color: '#757575',
    fontSize: '13px',
  },
  serial: {
    color: '#191919',
    fontWeight: 600,
  },
  updated: {
    color: '#999',
  },
  empty: {
    color: '#757575',
    fontSize: '15px',
    padding: '16px 0',
    textAlign: 'center',
    marginBottom: 0,
  },
});

const Owners = props => {
  const { assetId } = props;
  const [page, setPage] = useState(1);
  const [cursor, setCursor] = useState(null);
  const [owners, setOwners] = useState(null);
  const [locked, setLocked] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const thumbs = ThumbnailStore.useContainer();
  const s = useStyles();

  useEffect(() => {
    setLocked(true);
    setFeedback(null);

    getCollectibleOwners({
      assetId,
      cursor,
      sort: 'Asc',
      limit: 50,
    }).then(d => {
      setOwners(d);
    }).catch(e => {
      setFeedback(e.message);
    }).finally(() => {
      setLocked(false);
    })
  }, [cursor]);

  return <div>
    {
      feedback ? <p className='mb-4 mt-4 text-danger'>{feedback}</p> : null
    }
    {owners && owners.data.length === 0 && !feedback ? <p className={s.empty}>This item has no owners yet.</p> : null}
    {owners && owners.data.map(v => {
      const owner = v.owner;

      return <div key={v.userAssetId} className={s.entry}>
        <div className={s.avatarWrapper}>
          {owner ? <img className={s.avatar} src={thumbs.getUserHeadshot(owner.id) || '/img/placeholder.png'} alt={owner.name} onError={e => { e.target.src = '/img/placeholder.png' }} /> : <img className={s.avatar} src='/img/placeholder.png' alt='' />}
        </div>
        <div className={s.ownerInfo}>
          <p className={s.ownerName}>{owner ? <CreatorLink id={owner.id} name={owner.name} type='User'/> : 'Deleted/Private'}</p>
          <p className={s.ownerMeta}>
            Serial <span className={s.serial}>{v.serialNumber ? '#' + v.serialNumber : 'N/A'}</span>
            <span className={s.updated}> · Updated {dayjs(v.updated).fromNow()}</span>
          </p>
        </div>
        <div>
          {owner ? <ActionButton label='Trade' onClick={() => {
            window.open("/Trade/TradeWindow.aspx?TradePartnerID=" + owner.id, "_blank", "scrollbars=0, height=608, width=914");
          }}/> : null}
        </div>
      </div>
    })}
    <div className='text-center mt-3'>
      {owners && (owners.nextPageCursor || owners.previousPageCursor) ? <GenericPagination page={page} onClick={newPage => {
        return e => {
          e.preventDefault();
          if (newPage === 1) {
            if (!owners.nextPageCursor || locked) return
            setCursor(owners.nextPageCursor);
            setPage(page + 1);
          } else if (newPage === -1) {
            if (!owners.previousPageCursor || locked) return;
            setCursor(owners.previousPageCursor);
            setPage(page - 1);
          }
        }
      }}/> : null}
    </div>
  </div>
}

export default Owners;
import {useEffect, useState} from "react";
import {createFavorite, deleteFavorite, getIsFavorited} from "../../../services/catalog";
import authentication from "../../../stores/authentication";
import {createUseStyles} from "react-jss";

const useStyles = createUseStyles({
  wrapper: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    background: 'rgba(0,0,0,0.55)',
    borderRadius: '4px',
    padding: '5px 10px',
  },
  favoriteStar: {
    display: 'inline-block',
    width: '16px',
    height: '16px',
    background: 'url("/img/FavoriteStar.png")',
    backgroundSize: 'contain',
    cursor: 'pointer',
    marginBottom: '0',
    filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.5))',
  },
  favoritedStar: {
    filter: 'drop-shadow(0 0 3px rgba(255,204,0,0.9)) saturate(1.4)',
  },
  favoriteCount: {
    color: '#fff',
    fontSize: '13px',
    fontWeight: 600,
  },
  favoriteLink: {
    color: '#fff',
    fontSize: '13px',
    cursor: 'pointer',
    '&:hover': {
      textDecoration: 'underline',
    },
  },
});

const Favorite = props => {
  const {assetId} = props;
  const auth = authentication.useContainer();
  const s = useStyles();

  const [isFavorited, setIsFavorited] = useState(null);
  const [favoriteCount, setFavoriteCount] = useState(0);
  const [locked, setLocked] = useState(false);

  useEffect(() => {
    setIsFavorited(null);
    setFavoriteCount(props.favoriteCount);
    setLocked(false);

    if (auth.userId) {
      getIsFavorited({assetId, userId: auth.userId}).then(data => {
        setIsFavorited(!!data);
      }).catch(e => {
        // undefined/null response causes axios to incorrectly return network error :)
        setIsFavorited(false);
      })
    }
  }, [props.favoriteCount, props.assetId, auth.userId]);

  return <div className={s.wrapper}>
    <a href="#" onClick={e => {
      e.preventDefault();
      if (!auth.userId || locked) return;
      setLocked(true);
      setIsFavorited(!isFavorited);
      setFavoriteCount(isFavorited ? favoriteCount-1 : favoriteCount+1);
      if (isFavorited) {
        deleteFavorite({userId: auth.userId, assetId}).finally(() => {
          setLocked(false);
        })
      }else{
        createFavorite({userId: auth.userId, assetId}).finally(() => {
          setLocked(false);
        })
      }
    }}>
      <span className={s.favoriteStar + ' ' + (isFavorited ? s.favoritedStar : '')}/>
    </a>
    <span className={s.favoriteCount}>{favoriteCount.toLocaleString()}</span>
    {
      isFavorited !== null ? <a href="#" className={s.favoriteLink} onClick={e => {
        e.preventDefault();
        if (!auth.userId || locked) return;
        setLocked(true);
        setIsFavorited(!isFavorited);
        setFavoriteCount(isFavorited ? favoriteCount-1 : favoriteCount+1);
        if (isFavorited) {
          deleteFavorite({userId: auth.userId, assetId}).finally(() => {
            setLocked(false);
          })
        }else{
          createFavorite({userId: auth.userId, assetId}).finally(() => {
            setLocked(false);
          })
        }
      }}>{isFavorited ? 'Unfavorite' : 'Favorite'}</a> : null
    }
  </div>
}

export default Favorite;
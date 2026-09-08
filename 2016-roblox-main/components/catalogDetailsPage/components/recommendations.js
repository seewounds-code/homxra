import { useEffect, useState } from "react"
import { createUseStyles } from "react-jss"
import {getItemUrl, getRecommendations} from "../../../services/catalog"
import CreatorLink from "../../creatorLink"
import ItemImage from "../../itemImage"
import Link from "../../link";
import Robux from "./robux";

const useEntryStyles = createUseStyles({
  card: {
    background: '#fafafa',
    border: '1px solid #eee',
    borderRadius: '4px',
    padding: '10px',
    textAlign: 'center',
    height: '100%',
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    '&:hover': {
      boxShadow: '0 1px 6px 0 rgba(25,25,25,0.25)',
    },
  },
  image: {
    width: '100%',
    maxWidth: '110px',
    display: 'block',
    margin: '0 auto 8px',
  },
  name: {
    fontSize: '13px',
    fontWeight: 600,
    color: '#191919',
    marginBottom: '4px',
    lineHeight: '1.3',
    width: '100%',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  creator: {
    fontSize: '12px',
    color: '#757575',
    marginBottom: '4px',
  },
  price: {
    fontSize: '13px',
    marginTop: 'auto',
  },
})

const RecommendationEntry = props => {
  const s = useEntryStyles();
  return <div className='col-6 col-md-3 col-lg'>
    <div className={s.card}>
      <div className={s.image}>
        <ItemImage id={props.id}/>
      </div>
      <p className={s.name}>
        <Link href={getItemUrl({assetId: props.id, name: props.name})}>
          <a>
            {props.name}
          </a>
        </Link>
      </p>
      <p className={s.creator}>
        <CreatorLink id={props.creatorId} type={props.creatorType} name={props.creatorName}/>
      </p>
      <p className={s.price}>
        {props.price !== null && props.price !== undefined ?
          <Robux>{props.price.toLocaleString()}</Robux> :
          <span className='text-muted'>Free</span>}
      </p>
    </div>
  </div>
}

const useRecommenndationStyles = createUseStyles({
  row: {
    '& > div': {
      marginBottom: '10px',
    },
  }
});

/**
 * Recommendations based off the {assetId}
 * @param {{assetId: number; assetType: number;}} props 
 */
const Recommendations = props => {
  const s = useRecommenndationStyles();
  const [recommendations, setRecommendations] = useState(null);

  useEffect(() => {
    getRecommendations({
      assetId: props.assetId,
      assetTypeId: props.assetType,
      limit: 10,
    }).then(result => {
      setRecommendations(result.data);
    })
  }, [props.assetId])

  return <div className={`row ${s.row}`}>
    {
      recommendations && recommendations.map((v) => {
        const item = v.item || {};
        return <RecommendationEntry key={item.assetId} id={item.assetId} name={item.name} creatorId={v.creator.creatorId} creatorType={v.creator.creatorType} creatorName={v.creator.name} price={item.price}/>
      })
    }
    {
      recommendations && recommendations.length === 0 ? <div className='col-12'><p className='text-center text-muted mb-0'>No recommendations found.</p></div> : null
    }
  </div>
}

export default Recommendations;
import React, { PropTypes } from 'react'
import { partition, take } from 'underscore'
import AuctionBlock from '../auction_block/auction_block.jsx'

export default function CurrentAuctions ({ auctionContextId, sales }) {
  const sortedSales = sortSales(sales, auctionContextId)

  return (
    <section className='artwork-current-auctions'>
      <div className='artwork-current-auctions__header-area'>
        <h3>
          Current Auctions on Artsy
        </h3>

        <a href='/auctions'>
          View All Auctions
        </a>
      </div>

      <div className='artwork-current-auctions__sales'>
        {sortedSales.map((sale) => {
          const {
            cover_image,
            end_at,
            href,
            id,
            is_live_open,
            is_preview,
            name,
            live_start_at,
            start_at
          } = sale

          return (
            <AuctionBlock
              key={id}
              cover_image={cover_image}
              end_at={end_at}
              href={href}
              id={id}
              is_live_open={is_live_open}
              is_preview={is_preview}
              name={name}
              live_start_at={live_start_at}
              start_at={start_at}
            />
          )
        })}
      </div>
    </section>
  )
}

CurrentAuctions.propTypes = {
  /**
   * If the module is displayed in an Auction context (such as viewing an
   * artwork that is in a sale) and an auction id is provided, ensure the first
   * displayed item is the same as the context.
   */
  auctionContextId: PropTypes.string,
  sales: PropTypes.array.isRequired
}

CurrentAuctions.defaultProps = {
  auctionContextId: ''
}

// Helpers
// -------

function sortSales (sales, auctionContextId = '', CAP = 4) {
  const [ currentSale, rest ] = partition(sales, (sale) => sale.id === auctionContextId)
  const sorted = take(currentSale.concat(rest), CAP)
  return sorted
}

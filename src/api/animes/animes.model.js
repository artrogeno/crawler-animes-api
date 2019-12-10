import request from 'request'
import cheerio from 'cheerio'

import GATEWAY from '../../shared/constants/gateway'

const { URL_ANIMES_ONLINE_BR, URL_ANIMES_HOUSE } = GATEWAY

const _listGateway = [
  {
    title: 'Animes Online BR',
    gateway: 'animes-online-br',
    url: URL_ANIMES_ONLINE_BR,
  },
  { title: 'Animes House', gateway: 'animes-house', url: URL_ANIMES_HOUSE },
]

const getVideoNoRedirect = (uri, baseUrl) => {
  const promise = new Promise((resolve, reject) => {
    const prams = {
      uri,
      method: 'GET',
      simple: false,
      followRedirect: false,
      referer: baseUrl,
      headers: {
        referer: baseUrl,
      },
    }
    request(prams, (error, response, body) => {
      if (!error && response.statusCode == 302) {
        resolve(response.headers['location'])
      } else {
        reject(error)
      }
    })
  })
  return promise
}

const findGateway = uri => {
  return _listGateway.filter(item => item.url === uri)[0]
}

const crawler = uri => {
  const promise = new Promise((resolve, reject) => {
    request(uri, (error, response, body) => {
      if (!error && response.statusCode == 200) {
        resolve(body)
      } else {
        reject(error)
      }
    })
  })
  return promise
}

const removeLastString = str => {
  return str.substring(0, str.length - 1)
}

export const listGateway = () => {
  return _listGateway
}

export const getAnimesOnlineBR = async () => {
  try {
    const animes = []
    const { url: _uri, gateway } = findGateway(URL_ANIMES_ONLINE_BR)
    const uri = removeLastString(_uri)
    const html = await crawler(uri)
    const $ = cheerio.load(html)
    const content = $('.telinhas')
      .children('ul')
      .find('li')

    content.each((i, elem) => {
      const context = $(elem)
      let date = context.find('p').text()
      let title = context.find('.thumbTT').text()
      let url = context.find('.thumbTT').attr('href')
      let image = context
        .find('.thumbTel')
        .first()
        .find('img')
        .attr('data-src')
      let id = url
        .split(URL_ANIMES_ONLINE_BR)
        .slice(-1)[0]
        .split('/')[1]

      let urlEps = context
        .find('.episodiosLink')
        .find('a')
        .attr('href')
      const ep = urlEps
        .split(URL_ANIMES_ONLINE_BR)
        .slice(-1)[0]
        .split('/')
      let episodes = {
        id: ep[1],
        category: ep[0],
        url: urlEps,
      }

      animes.push({
        id,
        gateway,
        image,
        date: date.replace('.', ' ').trim(),
        title,
        url,
        episodes,
      })
    })

    return animes
  } catch (error) {
    console.log('ERROR: ', error)
  }
}

export const findEpOnAnimesOnlineBR = async id => {
  try {
    // https://animesonlinebr.site/video/670277858
    let videos = []
    let info = {
      title: null,
      episodes: null,
      prev: null,
      next: null,
    }
    const { url } = findGateway(URL_ANIMES_ONLINE_BR)
    const uri = `${url}video/${id}`
    const html = await crawler(uri)
    const $ = cheerio.load(html)

    const episode = $("a[title='EPISÓDIOS']").attr('href') || null
    const prev = $('#abas .setasVideo #seta01 > a').attr('href') || null
    const next = $('#abas .setasVideo #seta02 > a').attr('href') || null

    info.title = $('.contentBox > h1.single').text()
    if (episode) {
      const [category = null, id = null] = episode
        .split(URL_ANIMES_ONLINE_BR)[1]
        .split('/')
      info.episodes = { category, id }
    }
    if (prev) {
      const _prev = prev.split('/')
      info.prev = {
        id: _prev[_prev.length - 1],
        url: prev,
      }
    }
    if (next) {
      const _next = next.split('/')
      info.next = {
        id: _next[_next.length - 1],
        url: next,
      }
    }
    if ($('#urlplayer').text()) {
      let urlPlay = $('#urlplayer').text()
      let urlPlay0 = null
      if (urlPlay.includes(URL_ANIMES_ONLINE_BR) && urlPlay.includes('.mp4')) {
        urlPlay0 = await getVideoNoRedirect(urlPlay, uri)
      } else {
        urlPlay0 = urlPlay
      }
      videos.push(urlPlay0)
    }
    if ($('#urlplayerhd').text()) {
      videos.push($('#urlplayerhd').text())
    }

    let loop = true
    let ic = 1
    while (loop) {
      ic++
      if ($(`#urlplayer${ic}`).text()) videos.push($(`#urlplayer${ic}`).text())
      else loop = false
    }

    return { info, videos }
  } catch (error) {
    console.log('ERROR: ', error)
  }
}

export const listEpisodesOnAnimesOnlineBR = async (id, category) => {
  try {
    // https://animesonlinebr.site/legendados/53231
    const { url } = findGateway(URL_ANIMES_ONLINE_BR)
    const uri = `${url}${category}/${id}`
    const html = await crawler(uri)
    const $ = cheerio.load(html)
    let animes = {
      title: $('.contentBox > h1.single').text(),
      thumbnail: $('#capaAnime > img').attr('src'),
      info: [],
      summary: $('#sinopse2').text(),
      list: [],
    }

    $('.boxAnimeSobre > .boxAnimeSobreLinha').map((i, elem) => {
      const textSplit = $(elem)
        .text()
        .trim()
        .split(':')

      animes.info.push({
        key: textSplit[0],
        value: textSplit[1]
          .replace('\n', '')
          .replace('\t', '')
          .trim(),
      })
    })

    $('.boxAnimeSobre > div')
      .filter((i, elem) => $(elem).attr('itemprop') === 'season')
      .find('.boxAnimeSobreLinha')
      .map((i, elem) => {
        const textSplit = $(elem)
          .text()
          .trim()
          .split(':')
        if (textSplit.length === 1) {
          const subTextSplit = textSplit[0].split(' ')
          animes.info.push({
            key: subTextSplit[0],
            value: subTextSplit[1]
              .replace('\n', '')
              .replace('\t', '')
              .trim(),
          })
        }
        if (textSplit.length === 2) {
          animes.info.push({
            key: textSplit[0],
            value: textSplit[1]
              .replace('\n', '')
              .replace('\t', '')
              .trim(),
          })
        }
      })

    $('ul.lcp_catlist.list')
      .find('li')
      .map((i, elem) => {
        const link = $(elem).find('a')
        animes.list.push({
          title: $(link).text(),
          url: $(link).attr('href'),
          id: $(link)
            .attr('href')
            .split(URL_ANIMES_ONLINE_BR)[1]
            .split('video')[1]
            .replace('/', ''),
        })
      })

    return animes
  } catch (error) {
    console.log('ERROR: ', error)
  }
}

export const getAnimesHouse = async () => {
  try {
    const html = await crawler('https://animeshouse.net/')
    const $ = cheerio.load(html)
    const content = $('.animation-2.items')
    const articles = []

    content.find('article').each((i, elem) => {
      let image = $(elem)
        .children()
        .first()
        .find('img')
        .attr('src')

      let url = $(elem)
        .find('.data')
        .children()
        .find('a')
        .attr('href')

      let quality = $(elem)
        .children()
        .find('.quality')
        .text()

      let title = $(elem)
        .find('.data')
        .children()
        .find('a')
        .text()

      articles.push({
        image,
        url,
        quality,
        title,
      })
    })

    return articles
  } catch (error) {
    console.log('ERROR: ', error)
  }
}

export const getPlaysAnimesHouse = async uri => {
  const html = await crawler(uri)
  const $ = cheerio.load(html)
  const body = $('body').html()
  console.log(body)
  return body
}

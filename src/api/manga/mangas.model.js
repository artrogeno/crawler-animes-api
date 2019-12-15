import request from 'request'
import cheerio from 'cheerio'

import GATEWAY from '../../shared/constants/gateway'

const { URL_MANGA_HOSTED } = GATEWAY

const _listGateway = [
  {
    title: 'Manga Hosted',
    gateway: 'manga-hosted',
    url: URL_MANGA_HOSTED,
    working: true,
  },
]

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

export const listGateway = () => {
  return _listGateway
}

export const getMangaHosted = async (page = 1) => {
  try {
    const mangas = []
    let pages = {
      maxPage: 0,
      page,
      pageSize: 0,
    }
    const { url: _uri, gateway } = findGateway(URL_MANGA_HOSTED)
    const html = await crawler(`${_uri}/lancamentos/page/${page}`)
    const $ = cheerio.load(html)

    // PAGINATION
    const pageNumbers = $('.wp-pagenavi')
      .children()
      .first()
      .text()
    const [currentPage, lastPage] = pageNumbers
      .replace('Página', '')
      .trim()
      .split('de')

    pages.pageSize = $('.table-lancamentos tbody tr').length
    pages.maxPage = parseInt(lastPage)
    pages.page = parseInt(currentPage)

    // MANGA
    const content = $('.table-lancamentos tbody tr')

    content.each((i, elem) => {
      let image = null
      let title = null
      let manga = null
      let labels = null
      let chapters = []
      const context = $(elem)

      const getChapters = urlChapter => {
        const [, idChapter] = urlChapter
          .split(`${URL_MANGA_HOSTED}manga/`)[1]
          .split('/')

        chapters.push({
          id: parseInt(idChapter),
          url: urlChapter,
        })
      }

      const getBaseUrl = urlBase => {
        return urlBase.split(`${URL_MANGA_HOSTED}manga/`)[1]
      }

      const getLabels = elemData => {
        let str = []
        let elemContext = $(elemData)
        let small = elemContext.find('small').text()
        if (small.includes('Atualizado')) {
          let strSmall = small.replace('-', '').trim()
          str.push({ label: strSmall, type: 'dark' })
        } else {
          let labelSucess = elemContext.find('.label-success').text()
          let labelInfo = elemContext.find('.label-info').text()

          if (labelSucess) str.push({ label: labelSucess, type: 'success' })
          if (labelInfo) str.push({ label: labelInfo, type: 'primary' })
        }
        return str
      }

      const setLargeImage = img => img.replace('_medium.', '_large.')

      const box1 = context.children()[0]
      const box2 = context.children()[1]

      let urlBase = $(box2)
        .find('.entry-title > a')
        .attr('href')

      image = setLargeImage(
        $(box1)
          .find('img')
          .attr('src')
      )

      title = $(box2)
        .find('.entry-title')
        .first()
        .text()

      labels = getLabels($(box2).children())

      manga = getBaseUrl(urlBase)

      const chaptersList = $(box2)
        .find('.chapters')
        .children()

      if (chaptersList.length > 1) {
        $(chaptersList).each((i, chapter) => {
          let urlChapter = $(chapter).attr('href')
          getChapters(urlChapter)
        })
      } else {
        let urlChapter = chaptersList.attr('href')
        getChapters(urlChapter)
      }

      mangas.push({
        image,
        gateway,
        manga,
        chapters,
        title,
        labels,
      })
    })

    return { pages, mangas }
  } catch (error) {
    console.log('ERROR: ', error)
  }
}

export const listChaptersMangaHosted = async mangaBase => {
  try {
    let manga = {
      title: null,
      thumbnail: null,
      summary: null,
      manga: mangaBase,
      info: [],
      chapters: [],
    }
    const { url: _uri, gateway } = findGateway(URL_MANGA_HOSTED)
    const html = await crawler(`${_uri}/manga/${mangaBase}`)
    const $ = cheerio.load(html)
    const content = $('#page section')

    manga.title = content
      .find('.entry-title')
      .first()
      .text()

    manga.thumbnail = content.find('img.thumbnail').attr('src')

    manga.summary = content.find('article.well > #divSpdInText > p').text()

    content.find('.descricao li').each((i, elem) => {
      const context = $(elem)
      let [title, desc] = context.text().split(':')
      let description = desc.replace(/\s\s+/g, ' ').trim()
      manga.info.push({ title, description })
    })

    if (content.find('.list_chapters').contents().length) {
      content.find('.list_chapters li').each((i, elem) => {
        const context = $(elem)
        const label = context.children().text()
        const data = context.children().attr('data-content')
        const _this = cheerio.load(data)
        const chapter = _this('a')
          .attr('href')
          .split('/')
          .slice(-1)
          .pop()

        manga.chapters.push({
          chapter,
          label,
        })
      })
    } else {
      content.find('table tbody tr').each((i, elem) => {
        const context = $(elem)
        let _chapter = context.find('td > a.capitulo').attr('href')
        if (_chapter) {
          let _id = _chapter
            .split('/')
            .slice(-1)
            .pop()
          manga.chapters.push({
            chapter: _id,
            label: _id,
          })
        }
      })
    }

    return manga
  } catch (error) {
    console.log('ERROR: ', error)
  }
}

export const findChaptersMangaHosted = async (mangaBase, chapterBase) => {
  try {
    let manga = {
      title: null,
      manga: mangaBase,
      pageSize: null,
      pages: [],
    }
    const { url: _uri, gateway } = findGateway(URL_MANGA_HOSTED)
    const html = await crawler(`${_uri}/manga/${mangaBase}/${chapterBase}`)
    const $ = cheerio.load(html)

    manga.title = $('.entry-title').text()
    manga.pageSize = $('.viewerPage option').length

    const findTextAndReturnRemainder = (target, variable) => {
      var chopFront = target.substring(
        target.search(variable) + variable.length,
        target.length
      )
      var result = chopFront
        .substring(0, chopFront.search('];'))
        .substr(2)
        .slice(0, -1)
      return result
    }

    $('script').each((i, elem) => {
      const jquery = cheerio.load($(elem).html(), {
        withDomLvl1: false,
        normalizeWhitespace: false,
        xmlMode: false,
        decodeEntities: false,
      })
      const matchX = jquery.text().match(/var images = (.*);/)
      if (matchX) {
        const text = jquery.html()
        const findAndClean = findTextAndReturnRemainder(text, 'var images = ')
        const imagesArray = findAndClean.split('","')
        imagesArray.forEach((element, i) => {
          const jimage = cheerio.load(element)
          const img = jimage('img').attr('src')
          const page = jimage('a').attr('data-read-hash')
          manga.pages.push({ img, page })
        })
      }
    })
    return manga
  } catch (error) {
    console.log('ERROR: ', error)
  }
}

export const searchMangaOnMangaHosted = async search => {
  try {
    const { url: _uri, gateway } = findGateway(URL_MANGA_HOSTED)
    const html = await crawler(`${_uri}find/${search}`)
    const $ = cheerio.load(html)

    const mangas = []
    const title = $('title-widget > h1')
      .text()
      .trim()
    const content = $('#page > .table-search tbody tr')
    const setLargeImage = img => img.replace('_medium.', '_large.')

    content.each((i, elem) => {
      const mangaData = {}
      const context = $(elem)
      const box1 = context.children()[0]
      const box2 = context.children()[1]

      mangaData.image = setLargeImage(
        $(box1)
          .find('img.manga')
          .attr('data-path')
      )

      mangaData.title = $(box2)
        .find('.entry-title')
        .first()
        .text()
        .trim()

      const mangaUrl = $(box2)
        .find('.entry-title > a')
        .attr('href')

      mangaData.manga = mangaUrl.split(`${URL_MANGA_HOSTED}manga/`)[1]

      mangaData.subtitle = $(box2)
        .find('span.muted')
        .text()
        .trim()

      mangaData.summary = $(box2)
        .find('.entry-content')
        .text()
        .trim()

      mangas.push(mangaData)
    })

    return { title, gateway, mangas }
  } catch (error) {
    console.log('ERROR: ', error)
  }
}

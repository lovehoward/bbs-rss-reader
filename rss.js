const DOMPARSER = new DOMParser().parseFromString.bind(new DOMParser())
/* Fetch URLs from JSON */
var feeds_count=0;
var reviewedArticles=[];
if(localStorage.getItem("visited")) reviewedArticles=JSON.parse(localStorage.getItem("visited"));

fetch('urls.json').then((res) => {
	res.text().then((data) => {
		var frag = document.createDocumentFragment()
		var hasBegun = true
		JSON.parse(data).urls.forEach((u) => {
			try {
				var url = new URL(u)
			}
			catch (e) {
				console.error('URL invalid');
				return
			}
			fetch(url).then((res) => {
				res.text().then((xmlTxt) => {
							/* Parse the RSS Feed and display the content */
							try {
								let doc = DOMPARSER(xmlTxt, "text/xml")
								let heading = document.createElement('h2')
                                heading.className="heading"
								heading.textContent = url.hostname
                                console.log(heading)
								frag.appendChild(heading) 
                                feeds_count++

								doc.querySelectorAll('item').forEach((item) => {
									let temp = document.importNode(document.querySelector('template').content, true);
									let i = item.querySelector.bind(item)
									let t = temp.querySelector.bind(temp)
									t('h2').textContent = !!i('title') ? i('title').textContent : '-'
									t('link').href = !!i('link') ? i('link').textContent : '#'
									t('p').innerHTML = !!i('description') ? i('description').textContent : '-'
//                                    t('p').innerHTML += !!i('contentaaa') ? i('contentaaa').textContent : ""
									t('h3').textContent = url.hostname
                                    if(!reviewedArticles.includes(t('link').href.hashCode())) { t('h2').classList.add("unread")}
									frag.appendChild(temp)
                                    feeds_count++
								})

								doc.querySelectorAll('entry').forEach((item) => {
									let temp = document.importNode(document.querySelector('template').content, true);
									let i = item.querySelector.bind(item)
									let t = temp.querySelector.bind(temp)
									t('h2').textContent = !!i('title') ? i('title').textContent : '-'
									t('link').href = !!i('link[rel=alternate]') ? i('link[rel=alternate]').attributes["href"].nodeValue : '#'
									t('p').innerHTML = !!i('content') ? i('content').textContent : '-'
									t('h3').textContent = url.hostname
                                    if(!reviewedArticles.includes(t('link').href.hashCode())) { t('h2').classList.add("unread")}
									frag.appendChild(temp)
                                    feeds_count++
								})

							} catch (e) {
								console.error('Error in parsing the feed')
							}
							if(hasBegun) {
								document.querySelector('output').textContent = ''; 
								hasBegun = false;
							}
							document.querySelector('output').appendChild(frag)
						})
					}).catch(() => console.error('Error in fetching the RSS feed'))
				})
	})
}).catch(() => console.error('Error in fetching the URLs json'))

var container_top=0;
var sel_item=1;
document.onkeydown=function (e) {
  var key = e.keyCode;
  var o=document.querySelector('p.reading');
    if(o) {  //reading mode
        switch (key) {  
        case 33:
            o.scrollTop-=o.clientHeight;
            break;
        case 34:
            o.scrollTop+=o.clientHeight;
            break;
        case 36: //home
            o.scrollTop=0;
            break;
        case 35: //end
            o.scrollTop=o.scrollHeight;
            break;
        case 38:  //up
            o.scrollTop-=o.clientHeight/20;
            break;
        case 40:  // down
            o.scrollTop+=o.clientHeight/20;
            break;
        case 37: //left
            document.querySelector('p.reading').className="";
            break;
        }
        return;
    }

  switch(key) {
    case 13:  //enter
    case 39: //right
        document.querySelector("h2.sel+h3+link+p").className="reading";
        document.querySelector("h2.sel").classList.remove("unread");
        var doc_hash=document.querySelector("h2.sel+h3+link").href.hashCode();
        if(!reviewedArticles.includes(doc_hash)) {
            reviewedArticles.push(doc_hash);
            localStorage.setItem("visited", JSON.stringify(reviewedArticles));
        }
        break;

    case 33: //page up
        document.querySelectorAll('output>h2')[sel_item].classList.remove("sel");
        container_top+=95;
        if (container_top>=0) {container_top=0;}
        document.querySelector('output').style.top=(container_top)+'vh';
        sel_item=-container_top/5;
        if (document.querySelectorAll('output>h2')[sel_item].className=="heading") sel_item++
        break;
    case 34: //page down
        document.querySelectorAll('output>h2')[sel_item].classList.remove("sel");
        container_top-=95;
        if (container_top<-feeds_count*5+100) {container_top=-feeds_count*5+100}
        document.querySelector('output').style.top=(container_top)+'vh';
        sel_item=-container_top/5;
        if (document.querySelectorAll('output>h2')[sel_item].className=="heading") sel_item++
        break;
    case 38: //up
        document.querySelectorAll('output>h2')[sel_item].classList.remove("sel");
        sel_item=sel_item-1>0 ? sel_item-1:0;
        if (document.querySelectorAll('output>h2')[sel_item].className=="heading") sel_item++
        break;
    case 40: //down
        document.querySelectorAll('output>h2')[sel_item].classList.remove("sel");
        sel_item=sel_item+1<feeds_count ? sel_item+1:sel_item;
        if (document.querySelectorAll('output>h2')[sel_item].className=="heading") sel_item++
        break;
  }
  document.querySelectorAll('output>h2')[sel_item].classList.add("sel");
}

function setCookie(cname, cvalue, exdays) {
  var d = new Date();
  d.setTime(d.getTime() + (exdays*24*60*60*1000));
  var expires = "expires="+ d.toUTCString();
  document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}



String.prototype.hashCode = function() {
  var hash = 0, i, chr;
  if (this.length === 0) return hash;
  for (i = 0; i < this.length; i++) {
    chr   = this.charCodeAt(i);
    hash  = ((hash << 5) - hash) + chr;
    hash |= 0; // Convert to 32bit integer
  }
  return hash;
};

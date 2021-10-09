async function getData() {
  return Promise.resolve('this is');
}

async function getMoreData(data) {
  return Promise.resolve(data + ' ' + 'more data');
}

async function getAll() {
  const data = await getData();
  const moreData = await getMoreData(data);
  return moreData;
}

getAll().then((all) => {
  console.log(all)
})
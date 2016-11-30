import { asyncFuncCreator } from '../utils';

export function index(key) {
  return asyncFuncCreator({
    constant: 'SCREEN_INDEX',
    promise: (client) => client.request({ url: '/project/' + key + '/screen' })
  });
}

export function create(key, values) {
  return asyncFuncCreator({
    constant: 'SCREEN_CREATE',
    promise: (client) => client.request({ url: '/project/' + key + '/screen', method: 'post', data: values })
  });
}

export function edit(key, values) {
  return asyncFuncCreator({
    constant: 'SCREEN_EDIT',
    promise: (client) => client.request({ url: '/project/' + key + '/screen/' + values.id, method: 'put', data: values })
  });
}

export function show(id) {
  return { type: 'SCREEN_SHOW', id: id };
}

export function del(key, id) {
  return asyncFuncCreator({
    constant: 'SCREEN_DELETE',
    id,
    promise: (client) => client.request({ url: '/project/' + key + '/screen/' + id, method: 'delete' })
  });
}

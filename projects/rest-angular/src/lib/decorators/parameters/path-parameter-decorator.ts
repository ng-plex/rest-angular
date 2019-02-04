import {ParameterDecoratorFactory} from '../../factories/parameter-decorator-factory';

export const Path = (name: string) => ParameterDecoratorFactory.makeDecorator((endpoint, index) => {
  if (!endpoint.pathParametersName) {
    endpoint.pathParametersName = [];
  }

  endpoint.pathParametersName[index] = name;

  return endpoint;
});
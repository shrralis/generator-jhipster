import { defaultHelpers as helpers, runResult, getGenerator } from '../../test/support/index.mjs';
import { SERVER_MAIN_RES_DIR } from '../generator-constants.mjs';
import BaseApplicationGenerator from '../base-application/generator.mjs';

class MockedLanguagesGenerator extends BaseApplicationGenerator<any> {
  get [BaseApplicationGenerator.PREPARING]() {
    return {
      mockTranslations({ control }) {
        control.getWebappTranslation = () => 'translations';
      },
    };
  }
}

const entityFoo = { name: 'Foo', changelogDate: '20160926101210' };

describe('generator - entity database changelogs', () => {
  context('when regenerating the entity', () => {
    describe('with cassandra database', () => {
      before(async () => {
        await helpers
          .run(getGenerator('entity'))
          .withGenerators([[MockedLanguagesGenerator, 'jhipster:languages']])
          .withJHipsterConfig({ databaseType: 'cassandra' }, [entityFoo])
          .withArguments(['Foo'])
          .withOptions({ regenerate: true, force: true, ignoreNeedlesError: true });
      });

      it('should create database changelog for the entity', () => {
        runResult.assertFile([`${SERVER_MAIN_RES_DIR}config/cql/changelog/20160926101210_added_entity_Foo.cql`]);
      });
    });
    describe('with gateway application type', () => {
      before(async () => {
        await helpers
          .run(getGenerator('entity'))
          .withGenerators([[MockedLanguagesGenerator, 'jhipster:languages']])
          .withJHipsterConfig({ applicationType: 'gateway' }, [
            { ...entityFoo, microservicePath: 'microservice1', microserviceName: 'microservice1' },
          ])
          .withArguments(['Foo'])
          .withOptions({ regenerate: true, force: true, ignoreNeedlesError: true });
      });

      it('should not create database changelogs', () => {
        runResult.assertNoFile([
          `${SERVER_MAIN_RES_DIR}config/liquibase/changelog/20160926101210_added_entity_Foo.xml`,
          `${SERVER_MAIN_RES_DIR}config/liquibase/changelog/20160926101210_added_entity_constraints_Foo.xml`,
        ]);
      });
    });
  });
});

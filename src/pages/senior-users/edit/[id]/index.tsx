import AppLayout from 'layout/app-layout';
import React, { useState } from 'react';
import {
  FormControl,
  FormLabel,
  Input,
  Button,
  Text,
  Box,
  Spinner,
  FormErrorMessage,
  Switch,
  NumberInputStepper,
  NumberDecrementStepper,
  NumberInputField,
  NumberIncrementStepper,
  NumberInput,
  Center,
} from '@chakra-ui/react';
import * as yup from 'yup';
import DatePicker from 'react-datepicker';
import { FiEdit3 } from 'react-icons/fi';
import { useFormik, FormikHelpers } from 'formik';
import { getSeniorUserById, updateSeniorUserById } from 'apiSdk/senior-users';
import { Error } from 'components/error';
import { seniorUserValidationSchema } from 'validationSchema/senior-users';
import { SeniorUserInterface } from 'interfaces/senior-user';
import useSWR from 'swr';
import { useRouter } from 'next/router';
import { AsyncSelect } from 'components/async-select';
import { ArrayFormField } from 'components/array-form-field';
import { AccessOperationEnum, AccessServiceEnum, withAuthorization } from '@roq/nextjs';
import { UserInterface } from 'interfaces/user';
import { HealthPlanInterface } from 'interfaces/health-plan';
import { getUsers } from 'apiSdk/users';
import { getHealthPlans } from 'apiSdk/health-plans';

function SeniorUserEditPage() {
  const router = useRouter();
  const id = router.query.id as string;
  const { data, error, isLoading, mutate } = useSWR<SeniorUserInterface>(
    () => (id ? `/senior-users/${id}` : null),
    () => getSeniorUserById(id),
  );
  const [formError, setFormError] = useState(null);

  const handleSubmit = async (values: SeniorUserInterface, { resetForm }: FormikHelpers<any>) => {
    setFormError(null);
    try {
      const updated = await updateSeniorUserById(id, values);
      mutate(updated);
      resetForm();
      router.push('/senior-users');
    } catch (error) {
      setFormError(error);
    }
  };

  const formik = useFormik<SeniorUserInterface>({
    initialValues: data,
    validationSchema: seniorUserValidationSchema,
    onSubmit: handleSubmit,
    enableReinitialize: true,
    validateOnChange: false,
    validateOnBlur: false,
  });

  return (
    <AppLayout>
      <Box bg="white" p={4} rounded="md" shadow="md">
        <Box mb={4}>
          <Text as="h1" fontSize="2xl" fontWeight="bold">
            Edit Senior User
          </Text>
        </Box>
        {error && (
          <Box mb={4}>
            <Error error={error} />
          </Box>
        )}
        {formError && (
          <Box mb={4}>
            <Error error={formError} />
          </Box>
        )}
        {isLoading || (!formik.values && !error) ? (
          <Center>
            <Spinner />
          </Center>
        ) : (
          <form onSubmit={formik.handleSubmit}>
            <FormControl id="progress" mb="4" isInvalid={!!formik.errors?.progress}>
              <FormLabel>Progress</FormLabel>
              <Input type="text" name="progress" value={formik.values?.progress} onChange={formik.handleChange} />
              {formik.errors.progress && <FormErrorMessage>{formik.errors?.progress}</FormErrorMessage>}
            </FormControl>
            <AsyncSelect<UserInterface>
              formik={formik}
              name={'user_id'}
              label={'Select User'}
              placeholder={'Select User'}
              fetcher={getUsers}
              renderOption={(record) => (
                <option key={record.id} value={record.id}>
                  {record?.email}
                </option>
              )}
            />
            <AsyncSelect<HealthPlanInterface>
              formik={formik}
              name={'health_plan_id'}
              label={'Select Health Plan'}
              placeholder={'Select Health Plan'}
              fetcher={getHealthPlans}
              renderOption={(record) => (
                <option key={record.id} value={record.id}>
                  {record?.name}
                </option>
              )}
            />
            <Button isDisabled={formik?.isSubmitting} colorScheme="blue" type="submit" mr="4">
              Submit
            </Button>
          </form>
        )}
      </Box>
    </AppLayout>
  );
}

export default withAuthorization({
  service: AccessServiceEnum.PROJECT,
  entity: 'senior_user',
  operation: AccessOperationEnum.UPDATE,
})(SeniorUserEditPage);

import * as React from "react"
import {
  ChakraProvider,
  Box,
  Text,
  Link,
  VStack,
  Code,
  Grid,
  extendTheme,
  GridItem,
  Flex,
  Button,
  Heading,
  // Contents,
} from "@chakra-ui/react"
import { Card, CardHeader, CardBody, CardFooter } from '@chakra-ui/react'

import { Step, Steps, useSteps } from 'chakra-ui-steps';
import { ColorModeSwitcher } from "./ColorModeSwitcher"
import { Logo } from "./Logo"
import JSONInput from 'react-json-editor-ajrm';
import { JsonEditor as Editor } from 'jsoneditor-react';
import 'jsoneditor-react/es/editor.min.css';

import ace from 'brace';
import 'brace/mode/json';
import 'brace/theme/github';
import 'brace/theme/xcode';
import 'brace/theme/monokai';
import 'brace/theme/eclipse';


import { StepsTheme as StepsTheme } from 'chakra-ui-steps';


const theme = extendTheme({
  components: {
    Steps: StepsTheme,
  },
  baseStyle: (props: any) => {
    return {
      ...StepsTheme.baseStyle(props),
      icon: {
        ...StepsTheme.baseStyle(props).icon,
        // your custom styles here
        strokeWidth: "1px",
      },
    };
  },
});


const steps = [{ label: "Step 1" }, { label: "Step 2" }, { label: "Step 3" }]

export const Vertical = () => {
  const { nextStep, prevStep, reset, activeStep } = useSteps({
    initialStep: 0,
  })
  return (
    <>
      <Steps orientation="horizontal" activeStep={activeStep}>
        {steps.map(({ label }, index) => (
          <Step width="100%" label={label} key={label}>
            <div>Step {index + 1}</div>
            {/* <Contents my={1} index={index} /> */}
          </Step>
        ))}
      </Steps>
      {activeStep === steps.length ? (
        <Flex px={4} py={4} width="100%" flexDirection="column">
          <Heading fontSize="xl" textAlign="center">
            Woohoo! All steps completed!
          </Heading>
          <Button mx="auto" mt={6} size="sm" onClick={reset}>
            Reset
          </Button>
        </Flex>
      ) : (
        <Flex width="100%" justify="flex-end">
          <Button
            isDisabled={activeStep === 0}
            mr={4}
            onClick={prevStep}
            size="sm"
            variant="ghost"
          >
            Prev
          </Button>
          <Button size="sm" onClick={nextStep}>
            {activeStep === steps.length - 1 ? "Finish" : "Next"}
          </Button>
        </Flex>
      )}
    </>
  )
}

export const App = () => {

  return (<ChakraProvider theme={theme}>
    <Box textAlign="center" fontSize="xl">
      <Grid minH="100vh" p={3} style={{ marginLeft: '15%', marginRight: '15%' }}>
        <ColorModeSwitcher justifySelf="flex-end" />
        <Grid
          h='200px'
          templateRows='repeat(2, 1fr)'
          templateColumns='repeat(4, 1fr)'
          gap={4}
          style={{marginBottom: '5%'}}
        >
          <GridItem rowSpan={2} colSpan={2}>
            <Card>
              <CardHeader style={{ paddingBottom: '0px' }}>
                <Text>
                  Contact Raw
                </Text>
              </CardHeader>
              <CardBody>
                <Editor
                  mode="code"
                  value={{ data: 'test' }}
                  onChange={() => { }}
                  ace={ace}
                  theme="ace/theme/monokai"
                // schema={yourSchema}
                />
              </CardBody>
            </Card>
          </GridItem>
          <GridItem rowSpan={2} colSpan={2}>
            <Card>
              <CardHeader style={{ paddingBottom: '0px' }}>
                <Text>
                  Contact Input
                </Text>
              </CardHeader>
              <CardBody>
                <Editor
                  mode="code"
                  value={{ data: 'test' }}
                  onChange={() => { }}
                  ace={ace}
                  theme="ace/theme/monokai"
                // schema={yourSchema}
                />
              </CardBody>
            </Card>
          </GridItem>
        </Grid>
        <Grid
          h='200px'
          templateRows='repeat(2, 1fr)'
          templateColumns='repeat(4, 1fr)'
          gap={4}
        >
          <GridItem colSpan={2}>
            <Card>
              <CardHeader style={{ paddingBottom: '0px' }}>
                <Text>
                  Contact State
                </Text>
              </CardHeader>
              <CardBody>
                <Editor
                  mode="code"
                  value={{ data: 'test' }}
                  onChange={() => { }}
                  ace={ace}
                  theme="ace/theme/monokai"
                // schema={yourSchema}
                />
              </CardBody>
            </Card>

          </GridItem>
          <GridItem colSpan={2}>
            <Card style={{height: '100%'}}>
              <CardBody>
                <Button>
                  Create Transaction
                </Button>
              </CardBody>
            </Card>
          </GridItem>
        </Grid>
        <div style={{marginTop: '5%'}}>
          <Vertical />
        </div>
      </Grid>
    </Box>
  </ChakraProvider>)
}

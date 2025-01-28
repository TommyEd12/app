import * as React from "react";
import { Tailwind, Section, Text } from "@react-email/components";

export default function orderEmail( outSum: number ) {
  return (
    <Tailwind>
      <Section className="flex justify-center items-center w-full min-h-screen font-sans">
        <Section className="flex flex-col items-center w-76 rounded-2xl px-6 py-1 bg-gray-50">
          <Text className="text-xs font-medium text-violet-500">
            Ваш заказ
          </Text>
          <Text className="text-gray-500 my-0">
            Ваш заказ обработан, сумма заказа представлена ниже:
          </Text>
          <Text className="text-5xl font-bold pt-2">{outSum}</Text>
          <Text className="text-gray-400 font-light text-xs pb-4">
            В скором времени с вами свяжется наш менеджер для уточнения информации о доствке
          </Text>
          <Text className="text-gray-600 text-xs">Спасибо за использование нашего сервиса!</Text>
        </Section>
      </Section>
    </Tailwind>
  );
}

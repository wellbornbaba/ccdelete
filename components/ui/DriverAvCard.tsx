import React from 'react'
import { Card } from './Card'
import { View, Text } from 'react-native'
import { Avatar } from './Avatar'
import { User } from '@/types'
import { Feather, Ionicons } from '@expo/vector-icons'
import { bgPrimarColor } from '@/utils/colors'


function DriverAvCard({driver}: {driver: User}) {
  return (
    <Card>
        <View>
            <Avatar />
            <View>
                <View>
                    <Text>{`${driver.firstName}  ${driver.lastName}`}</Text>
                    <Ionicons name="car" size={20} color={bgPrimarColor} />
                </View>
            </View>
        </View>
    </Card>
  )
}

export default DriverAvCard
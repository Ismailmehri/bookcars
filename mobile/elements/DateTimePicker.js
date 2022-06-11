import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Pressable, Text } from 'react-native';
import ReactDateTimePicker from '@react-native-community/datetimepicker';

import Helper from '../common/Helper';
import moment from 'moment';
import 'moment/locale/fr';

export default function DateTimePicker(props) {
    const [label, setLabel] = useState('');
    const [value, setValue] = useState(props.value);
    const [show, setShow] = useState(false);
    const format = props.mode === 'date' ? 'dddd, D MMMM YYYY' : 'HH:mm';
    const now = new Date();

    useEffect(() => {
        moment.locale(props.locale);
        setLabel((value && Helper.capitalize(moment(value).format(format))) || props.label);
    }, [props.locale]);

    useEffect(() => {
        setValue(props.value);
        setLabel((value && Helper.capitalize(moment(value).format(format))) || props.label);
    }, [props.value]);

    const styles = StyleSheet.create({
        container: {
            maxWidth: 480
        },
        label: {
            backgroundColor: props.backgroundColor ?? '#fafafa',
            color: 'rgba(0, 0, 0, 0.6)',
            fontSize: 12,
            fontWeight: '400',
            paddingRight: 5,
            paddingLeft: 5,
            marginLeft: 15,
            position: 'absolute',
            top: -10,
            zIndex: 1
        },
        dateContainer: {
            alignSelf: 'stretch',
            height: 55,
            borderWidth: 1,
            borderRadius: 10,
            borderColor: props.error ? '#d32f2f' : 'rgba(0, 0, 0, 0.23)',
            backgroundColor: '#fafafa',
        },
        dateButton: {
            height: 55,
            alignSelf: 'stretch',
            flexDirection: 'row',
            display: 'flex',
            alignItems: 'center',
        },
        dateText: {
            fontSize: 15,
            paddingLeft: 15
        },
        helperText: {
            color: props.error ? '#d32f2f' : 'rgba(0, 0, 0, 0.23)',
            fontSize: 12,
            fontWeight: '400',
            paddingLeft: 5,
        }
    });

    return (
        <View style={{ ...props.style, ...styles.container }}>
            {value && <Text style={styles.label}>{props.label}</Text>}
            <View style={styles.dateContainer}>
                <Pressable
                    style={styles.dateButton}
                    onPress={() => {
                        setShow(true);
                        if (props.onPress) props.onPress();
                    }} >
                    <Text style={{
                        ...styles.dateText,
                        color: value ? 'rgba(0, 0, 0, 0.87)' : 'rgba(0, 0, 0, .4)',
                    }}>{label}</Text>
                </Pressable>
                <Text style={styles.helperText}>{props.helperText}</Text>
                {show &&
                    <ReactDateTimePicker mode={props.mode} value={value ?? now} minimumDate={props.minimumDate} onChange={(event, date) => {
                        setShow(false);
                        if (date.getTime() !== now.getTime()) {
                            setValue(date);
                            if (props.onChange) props.onChange(date);
                        }
                    }} />
                }
            </View>
        </View>
    );
}